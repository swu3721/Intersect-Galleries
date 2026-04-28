import { supabase } from './supabase';
import { getPortfolioPublicUrl } from './storage';
import {
  coverColorFromSeed,
  initialsFromName,
  stringToColor,
} from './userDisplay';
import { normalizePortfolioTemplate } from './portfolioTemplate';

function readFollowBatchMap(batch, id, which) {
  const m = batch?.[which];
  if (!m || typeof m !== 'object') return 0;
  const v = m[id] ?? m[String(id)];
  return typeof v === 'number' ? v : Number(v) || 0;
}

function mapItemRowToArtwork(row) {
  const createdAt = row.created_at || null;
  return {
    id: row.id,
    collection_id: row.collection_id,
    title: row.title,
    category: row.category,
    color: stringToColor(row.id),
    likes: 0,
    year: createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear(),
    created_at: createdAt,
    media_type: row.media_type,
    storage_path: row.storage_path,
    mediaUrl: getPortfolioPublicUrl(row.storage_path),
  };
}

export async function fetchProfileByUsername(username, viewerId = null) {
  const u = String(username).toLowerCase().trim();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', u)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const { data: collections, error: colError } = await supabase
    .from('portfolio_collections')
    .select('*')
    .eq('user_id', profile.id)
    .order('sort_order', { ascending: true });

  if (colError) throw colError;

  const { data: items, error: itemsError } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', profile.id)
    .order('sort_order', { ascending: true });

  if (itemsError) throw itemsError;

  const { data: batchRaw, error: batchErr } = await supabase.rpc('follow_stats_batch', {
    ids: [profile.id],
  });
  if (batchErr) console.warn('follow_stats_batch', batchErr);

  const batch = batchRaw || { followers: {}, following: {} };
  const fid = profile.id;
  const followers = readFollowBatchMap(batch, fid, 'followers');
  const followingCount = readFollowBatchMap(batch, fid, 'following');

  let viewerFollows = false;
  if (viewerId && viewerId !== profile.id) {
    const { data: rel } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', viewerId)
      .eq('following_id', profile.id)
      .maybeSingle();
    viewerFollows = !!rel;
  }

  return {
    profile,
    collections: collections ?? [],
    items: items ?? [],
    stats: {
      followers,
      following: followingCount,
      viewerFollows,
    },
  };
}

/**
 * Public collection + ordered pieces for the fullscreen viewer.
 */
export async function fetchPublicCollection(username, collectionId) {
  const u = String(username).toLowerCase().trim();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', u)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const { data: collection, error: cErr } = await supabase
    .from('portfolio_collections')
    .select('*')
    .eq('id', collectionId)
    .eq('user_id', profile.id)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!collection) return null;

  const { data: items, error: iErr } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });
  if (iErr) throw iErr;

  return {
    profile,
    collection,
    items: items ?? [],
  };
}

export function mapProfileRowsToViewModel(profile, items, stats = {}, collectionsRows = []) {
  const list = items ?? [];
  const cols = [...(collectionsRows ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  const itemsByCol = new Map();
  for (const row of list) {
    const cid = row.collection_id;
    if (!cid) continue;
    const arr = itemsByCol.get(cid) ?? [];
    arr.push(row);
    itemsByCol.set(cid, arr);
  }

  const collections = cols.map((c) => {
    const pieceRows = [...(itemsByCol.get(c.id) ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const pieces = pieceRows.map(mapItemRowToArtwork);
    const cover = pieces[0];
    return {
      id: c.id,
      title: c.title || 'Untitled collection',
      description: c.description || '',
      coverUrl: cover?.mediaUrl ?? null,
      coverColor: stringToColor(c.id),
      pieceCount: pieces.length,
      pieces,
      spotifyTrackId: c.spotify_track_id || null,
    };
  });

  const artworks = [];
  for (const c of cols) {
    const pieceRows = [...(itemsByCol.get(c.id) ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    for (const row of pieceRows) {
      artworks.push(mapItemRowToArtwork(row));
    }
  }

  const tags = [...new Set(list.map((i) => i.category).filter(Boolean))].slice(0, 8);

  return {
    id: profile.id,
    username: profile.username,
    name: profile.display_name,
    bio:
      profile.bio?.trim() ||
      'Creative professional sharing my work on Intersect.',
    avatar: null,
    avatarColor: stringToColor(profile.id),
    initials: initialsFromName(profile.display_name),
    coverColor: coverColorFromSeed(profile.id),
    cover_image_url: profile.cover_image_url,
    avatar_url: profile.avatar_url,
    location: profile.location || '',
    website: profile.website || '',
    followers: stats.followers ?? 0,
    following: stats.following ?? 0,
    collections,
    artworks,
    tags,
    portfolio_template: normalizePortfolioTemplate(profile.portfolio_template),
    onboarding_complete: profile.onboarding_complete,
    _source: 'supabase',
  };
}

/** Delete a portfolio item you own; removes DB row and storage object. */
export async function deletePortfolioItemForCurrentUser(itemId, storagePath) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('You must be signed in.');

  const { error: delErr } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', session.user.id);

  if (delErr) throw delErr;

  if (storagePath) {
    const { error: stErr } = await supabase.storage.from('portfolio').remove([storagePath]);
    if (stErr) console.warn('Storage delete:', stErr);
  }
}

/** Delete a collection you own (cascades items), then remove files from storage. */
export async function deletePortfolioCollectionForCurrentUser(collectionId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('You must be signed in.');

  const { data: col, error: cErr } = await supabase
    .from('portfolio_collections')
    .select('id, audio_storage_path')
    .eq('id', collectionId)
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!col) throw new Error('Collection not found.');

  const { data: items, error: iErr } = await supabase
    .from('portfolio_items')
    .select('storage_path')
    .eq('collection_id', collectionId)
    .eq('user_id', session.user.id);
  if (iErr) throw iErr;

  const paths = (items ?? []).map((r) => r.storage_path).filter(Boolean);
  if (col.audio_storage_path) paths.push(col.audio_storage_path);

  const { error: delErr } = await supabase
    .from('portfolio_collections')
    .delete()
    .eq('id', collectionId)
    .eq('user_id', session.user.id);
  if (delErr) throw delErr;

  if (paths.length) {
    const { error: stErr } = await supabase.storage.from('portfolio').remove(paths);
    if (stErr) console.warn('Storage delete:', stErr);
  }
}

export async function fetchProfilesForExplore(limit = 48) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('onboarding_complete', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  if (!data?.length) return [];

  const ids = data.map((p) => p.id);

  const { data: allCollections, error: colError } = await supabase
    .from('portfolio_collections')
    .select('*')
    .in('user_id', ids);

  if (colError) {
    console.error(colError);
    return [];
  }

  const { data: allItems, error: itemsError } = await supabase
    .from('portfolio_items')
    .select('*')
    .in('user_id', ids);

  if (itemsError) {
    console.error(itemsError);
    return [];
  }

  const byUserCollections = new Map();
  for (const row of allCollections ?? []) {
    const list = byUserCollections.get(row.user_id) ?? [];
    list.push(row);
    byUserCollections.set(row.user_id, list);
  }

  const byUserItems = new Map();
  for (const row of allItems ?? []) {
    const list = byUserItems.get(row.user_id) ?? [];
    list.push(row);
    byUserItems.set(row.user_id, list);
  }

  const { data: batchRaw, error: batchErr } = await supabase.rpc('follow_stats_batch', {
    ids,
  });
  if (batchErr) console.warn('follow_stats_batch', batchErr);
  const batch = batchRaw || { followers: {}, following: {} };

  return data.map((profile) => {
    const collections = (byUserCollections.get(profile.id) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const items = (byUserItems.get(profile.id) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const fid = profile.id;
    const stats = {
      followers: readFollowBatchMap(batch, fid, 'followers'),
      following: readFollowBatchMap(batch, fid, 'following'),
    };
    return mapProfileRowsToViewModel(profile, items, stats, collections);
  });
}

/**
 * Follow or unfollow a profile (current user is follower). Requires auth + applies RLS.
 */
export async function setFollowTarget(followingProfileId, shouldFollow) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    const err = new Error('Sign in to follow creators.');
    err.code = 'SIGN_IN_REQUIRED';
    throw err;
  }
  const followerId = session.user.id;
  if (followerId === followingProfileId) {
    throw new Error('Cannot follow yourself.');
  }

  if (shouldFollow) {
    const { error } = await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingProfileId,
    });
    if (error) {
      if (error.code === '23505') return;
      throw error;
    }
  } else {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingProfileId);
    if (error) throw error;
  }
}
