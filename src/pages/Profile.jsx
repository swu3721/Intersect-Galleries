import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { users } from '../data/mockData';
import { categories } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  deletePortfolioCollectionForCurrentUser,
  deletePortfolioItemForCurrentUser,
  fetchProfileByUsername,
  mapProfileRowsToViewModel,
  setFollowTarget,
} from '../lib/supabaseProfiles';
import { supabase } from '../lib/supabase';
import { normalizePortfolioTemplate } from '../lib/portfolioTemplate';
import { PortfolioWorksSection } from '../components/portfolioTemplates/PortfolioLayouts';
import { effectiveCollections, splitPortfolioForRails } from '../lib/portfolioDisplay';
import './Profile.css';

function websiteHref(website) {
  const w = String(website || '').trim();
  if (!w) return '';
  if (/^https?:\/\//i.test(w)) return w;
  return `https://${w}`;
}

const MAX_FILE_BYTES = 50 * 1024 * 1024;

function isAllowedMedia(file) {
  if (!file) return false;
  if (file.type.startsWith('image/')) return true;
  if (file.type === 'video/mp4' || file.type === 'video/webm') return true;
  return false;
}

function mediaTypeFromFile(file) {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

async function uploadToPortfolio(userId, relativePath, file) {
  const path = `${userId}/${relativePath}`;
  const { error } = await supabase.storage.from('portfolio').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

function mockProfileWithCollections(user) {
  const artworks = user?.artworks ?? [];
  if (!artworks.length) return { ...user, collections: [] };
  const pieces = artworks.map((a) => ({
    ...a,
    media_type: a.media_type || 'image',
    mediaUrl: a.mediaUrl ?? null,
    storage_path: a.storage_path,
  }));
  return {
    ...user,
    collections: [
      {
        id: `mock-${user.username}`,
        title: 'Works',
        description: '',
        coverUrl: pieces[0]?.mediaUrl ?? null,
        coverColor: pieces[0]?.color,
        pieceCount: pieces.length,
        pieces,
      },
    ],
  };
}

function ProfileArtsyFlourish({ mirror }) {
  return (
    <span
      className={`profile-artsy-flourish${mirror ? ' profile-artsy-flourish--mirror' : ''}`}
      aria-hidden="true"
    >
      <svg className="profile-artsy-flourish__svg" viewBox="0 0 88 260" focusable="false">
        <path
          d="M68 250 C32 185 22 130 26 78 C30 42 42 20 58 8"
          fill="none"
          stroke="#6d8f74"
          strokeOpacity="0.52"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <ellipse cx="44" cy="198" rx="11" ry="5.5" transform="rotate(-38 44 198)" fill="#8eb896" fillOpacity="0.36" />
        <ellipse cx="54" cy="152" rx="9" ry="4.5" transform="rotate(18 54 152)" fill="#9dc4a5" fillOpacity="0.3" />
        <ellipse cx="34" cy="114" rx="8" ry="4" transform="rotate(-48 34 114)" fill="#8eb896" fillOpacity="0.34" />
        <ellipse cx="48" cy="74" rx="7" ry="3.5" transform="rotate(22 48 74)" fill="#b5d4bb" fillOpacity="0.38" />
        <circle cx="56" cy="54" r="2.8" fill="#f6faf7" fillOpacity="0.92" />
        <circle cx="62" cy="36" r="2" fill="#ffffff" fillOpacity="0.88" />
      </svg>
    </span>
  );
}

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { session, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [followError, setFollowError] = useState('');
  const [activeTab, setActiveTab] = useState('collections');
  const [workDeleteError, setWorkDeleteError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState('');
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState('');
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionPieceTitle, setNewCollectionPieceTitle] = useState('');
  const [newCollectionPieceCategory, setNewCollectionPieceCategory] = useState('Mixed Media');
  const [newCollectionPieceFile, setNewCollectionPieceFile] = useState(null);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkCategory, setNewWorkCategory] = useState('Mixed Media');
  const [newWorkFile, setNewWorkFile] = useState(null);

  useEffect(() => {
    setActiveTab('collections');
  }, [username]);

  useEffect(() => {
    if (!user) return;
    if (String(user.username).toLowerCase() !== String(username).toLowerCase()) return;
    if (effectiveCollections(user).length === 0) {
      setActiveTab((t) => (t === 'collections' ? 'works' : t));
    }
  }, [user, username]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const uname = String(username).toLowerCase().trim();
      try {
        const viewerId = session?.user?.id ?? null;
        const row = await fetchProfileByUsername(uname, viewerId);
        if (cancelled) return;
        if (row) {
          setUser(
            mapProfileRowsToViewModel(
              row.profile,
              row.items,
              row.stats,
              row.collections ?? [],
            ),
          );
          setFollowing(row.stats?.viewerFollows ?? false);
        } else {
          const mock = users.find((u) => u.username === uname);
          setFollowing(false);
          setUser(
            mock
              ? mockProfileWithCollections({
                  ...mock,
                  portfolio_template: mock.portfolio_template || 'minimalist',
                  _source: 'mock',
                })
              : null,
          );
        }
      } catch (e) {
        console.error(e);
        const mock = users.find((u) => u.username === uname);
        if (!cancelled) {
          setFollowing(false);
          setUser(
            mock
              ? mockProfileWithCollections({
                  ...mock,
                  portfolio_template: mock.portfolio_template || 'minimalist',
                  _source: 'mock',
                })
              : null,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, session?.user?.id]);

  const isOwner = useMemo(() => {
    if (!user) return false;
    if (user._source === 'supabase' && session?.user?.id === user.id) return true;
    if (user._source === 'mock' && currentUser?.username === user.username) return true;
    return false;
  }, [user, session?.user?.id, currentUser?.username]);

  const categoryChoices = useMemo(
    () => categories.filter((c) => c !== 'All'),
    [],
  );

  const resetAddState = useCallback(() => {
    setAddType('');
    setAddError('');
    setAddBusy(false);
    setNewCollectionTitle('');
    setNewCollectionPieceTitle('');
    setNewCollectionPieceCategory(categoryChoices[0] || 'Mixed Media');
    setNewCollectionPieceFile(null);
    setNewWorkTitle('');
    setNewWorkCategory(categoryChoices[0] || 'Mixed Media');
    setNewWorkFile(null);
  }, [categoryChoices]);

  const openAddModal = useCallback(() => {
    if (!isOwner) return;
    resetAddState();
    setAddOpen(true);
  }, [isOwner, resetAddState]);

  const closeAddModal = useCallback(() => {
    setAddOpen(false);
    resetAddState();
  }, [resetAddState]);

  const reloadProfileFromDb = useCallback(async () => {
    const uname = String(username).toLowerCase().trim();
    const viewerId = session?.user?.id ?? null;
    const row = await fetchProfileByUsername(uname, viewerId);
    if (!row) return;
    setUser(
      mapProfileRowsToViewModel(
        row.profile,
        row.items,
        row.stats,
        row.collections ?? [],
      ),
    );
    setFollowing(row.stats?.viewerFollows ?? false);
  }, [username, session?.user?.id]);

  const handleFollowToggle = useCallback(async () => {
    if (!user || user._source !== 'supabase') return;
    if (isOwner) return;
    if (!session?.user?.id) {
      navigate('/login', { state: { from: `/profile/${user.username}` } });
      return;
    }
    setFollowBusy(true);
    setFollowError('');
    const wasFollowing = following;
    const prevFollowers = user.followers;
    const next = !wasFollowing;
    try {
      await setFollowTarget(user.id, next);
      setFollowing(next);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              followers: Math.max(0, prevFollowers + (next ? 1 : -1)),
            }
          : prev,
      );
    } catch (e) {
      setFollowing(wasFollowing);
      setUser((prev) => (prev ? { ...prev, followers: prevFollowers } : prev));
      const code = e?.code ?? e?.cause?.code;
      if (
        code === 'SIGN_IN_REQUIRED'
        || e?.message === 'Sign in to follow creators.'
      ) {
        navigate('/login', { state: { from: `/profile/${user.username}` } });
      } else {
        setFollowError(e?.message || 'Could not update follow.');
      }
    } finally {
      setFollowBusy(false);
    }
  }, [user, session?.user?.id, following, isOwner, navigate]);

  const template = normalizePortfolioTemplate(user?.portfolio_template);
  const site = user ? websiteHref(user.website) : '';
  const boldDiscipline =
    user?.tags?.[0]
    || user?.collections?.[0]?.pieces?.[0]?.category
    || user?.artworks?.[0]?.category
    || '';

  const artsyHeaderSectionStyle = useMemo(() => {
    if (!user || template !== 'artsy') return undefined;
    if (user.cover_image_url) {
      return {
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0) 26%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.72) 76%, #ffffff 100%), url(${JSON.stringify(user.cover_image_url)})`,
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
      };
    }
    const fallback = user.coverColor && String(user.coverColor).trim() ? user.coverColor : '#ececee';
    return {
      backgroundImage: `linear-gradient(to bottom, ${fallback} 0%, rgba(255,255,255,0.55) 48%, #ffffff 100%)`,
    };
  }, [template, user]);

  const handleDeleteWork = useCallback(async (artwork) => {
    if (!user || user._source !== 'supabase') return;
    if (
      !window.confirm(
        `Remove “${artwork.title}” from your portfolio? This cannot be undone.`,
      )
    ) {
      return;
    }
    setWorkDeleteError('');
    try {
      await deletePortfolioItemForCurrentUser(artwork.id, artwork.storage_path);
      setUser((prev) => {
        if (!prev) return prev;
        const nextArtworks = prev.artworks.filter((a) => a.id !== artwork.id);
        const nextCollections = (prev.collections ?? []).map((c) => ({
          ...c,
          pieces: (c.pieces ?? []).filter((p) => p.id !== artwork.id),
          pieceCount: (c.pieces ?? []).filter((p) => p.id !== artwork.id).length,
        }));
        const tags = [...new Set(nextArtworks.map((i) => i.category).filter(Boolean))].slice(
          0,
          8,
        );
        return { ...prev, artworks: nextArtworks, collections: nextCollections, tags };
      });
    } catch (e) {
      setWorkDeleteError(e.message || 'Could not delete that work.');
    }
  }, [user]);

  const handleDeleteCollection = useCallback(async (col) => {
    if (!user || user._source !== 'supabase') return;
    if (
      !window.confirm(
        `Remove the collection “${col.title}” and all pieces in it? This cannot be undone.`,
      )
    ) {
      return;
    }
    setWorkDeleteError('');
    try {
      await deletePortfolioCollectionForCurrentUser(col.id);
      setUser((prev) => {
        if (!prev) return prev;
        const removedIds = new Set((col.pieces ?? []).map((p) => p.id));
        const nextArtworks = (prev.artworks ?? []).filter((a) => !removedIds.has(a.id));
        const nextCollections = (prev.collections ?? []).filter((c) => c.id !== col.id);
        const tags = [...new Set(nextArtworks.map((i) => i.category).filter(Boolean))].slice(
          0,
          8,
        );
        return { ...prev, artworks: nextArtworks, collections: nextCollections, tags };
      });
    } catch (e) {
      setWorkDeleteError(e.message || 'Could not delete that collection.');
    }
  }, [user]);

  const handleAddPortfolioEntry = useCallback(async () => {
    if (!isOwner) return;
    if (!session?.user?.id || !user?.username) {
      setAddError('You must be signed in.');
      return;
    }
    if (user._source !== 'supabase') {
      navigate('/onboarding');
      return;
    }
    if (!addType) {
      setAddError('Choose what you want to add first.');
      return;
    }

    const file = addType === 'collection' ? newCollectionPieceFile : newWorkFile;
    if (!file) {
      setAddError('Please choose a media file.');
      return;
    }
    if (!isAllowedMedia(file)) {
      setAddError('Use an image or MP4/WebM video.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setAddError('Each file must be 50MB or smaller.');
      return;
    }

    setAddBusy(true);
    setAddError('');
    try {
      const userId = session.user.id;
      const { data: sortRows } = await supabase
        .from('portfolio_collections')
        .select('sort_order')
        .eq('user_id', userId);
      const nextSort =
        sortRows?.length > 0
          ? Math.max(...sortRows.map((r) => Number(r.sort_order) || 0)) + 1
          : 0;

      let collectionTitle = 'Untitled collection';
      let itemTitle = 'Untitled';
      let itemCategory = categoryChoices[0] || 'Mixed Media';

      if (addType === 'collection') {
        collectionTitle = newCollectionTitle.trim() || 'Untitled collection';
        itemTitle = newCollectionPieceTitle.trim() || 'Untitled';
        itemCategory = newCollectionPieceCategory || itemCategory;
      } else {
        collectionTitle = 'Single works';
        itemTitle = newWorkTitle.trim() || 'Untitled';
        itemCategory = newWorkCategory || itemCategory;
      }

      const collectionId = crypto.randomUUID();
      const { error: colErr } = await supabase.from('portfolio_collections').insert({
        id: collectionId,
        user_id: userId,
        title: collectionTitle,
        audio_storage_path: null,
        sort_order: nextSort,
      });
      if (colErr) throw colErr;

      const safeName = file.name.replace(/[^\w.-]+/g, '_');
      const storage_path = await uploadToPortfolio(
        userId,
        `items/${crypto.randomUUID()}/${safeName}`,
        file,
      );

      const { error: itemErr } = await supabase.from('portfolio_items').insert({
        user_id: userId,
        collection_id: collectionId,
        title: itemTitle,
        category: itemCategory,
        media_type: mediaTypeFromFile(file),
        storage_path,
        sort_order: 0,
      });
      if (itemErr) throw itemErr;

      await reloadProfileFromDb();
      setActiveTab(addType === 'collection' ? 'collections' : 'works');
      closeAddModal();
    } catch (e) {
      setAddError(e?.message || 'Could not add to portfolio.');
    } finally {
      setAddBusy(false);
    }
  }, [
    isOwner,
    session?.user?.id,
    user?.username,
    user?._source,
    addType,
    newCollectionPieceFile,
    newWorkFile,
    categoryChoices,
    newCollectionTitle,
    newCollectionPieceTitle,
    newCollectionPieceCategory,
    newWorkTitle,
    newWorkCategory,
    reloadProfileFromDb,
    closeAddModal,
    navigate,
  ]);

  if (loading) {
    return (
      <div className="profile-loading" role="status">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-not-found">
        <h2>User not found</h2>
        <p>
          The profile <strong>@{username}</strong> doesn&apos;t exist.
        </p>
        <Link to="/explore" className="btn-primary">Browse artists</Link>
      </div>
    );
  }

  const onDeleteCollection =
    isOwner && user._source === 'supabase' ? handleDeleteCollection : undefined;
  const onDeleteWork =
    isOwner && user._source === 'supabase' ? handleDeleteWork : undefined;

  const { railCollections, railWorks } = splitPortfolioForRails(user);
  const workStatCount =
    railCollections.length > 0 ? railCollections.length : railWorks.length;
  const workStatLabel = railCollections.length > 0 ? 'Collections' : 'Works';

  return (
    <div className={`profile profile--tpl-${template}`}>
      {template !== 'artsy' && (
        <div
          className="profile-cover"
          style={{
            background: user.cover_image_url ? '#0a0a0f' : user.coverColor,
            backgroundImage: user.cover_image_url ? `url(${user.cover_image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!user.cover_image_url && (
            <div className="profile-cover-artworks">
              {user.artworks.slice(0, 5).map((art, i) => (
                <div
                  key={art.id}
                  className="cover-art-strip"
                  style={{
                    '--i': i,
                    backgroundColor: art.color,
                    ...(art.mediaUrl
                      ? {
                          backgroundImage: `url(${art.mediaUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}),
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className={`profile-header-section${template === 'artsy' ? ` profile-header-section--artsy${user.cover_image_url ? ' profile-header-section--artsy-cover' : ''}` : ''}`}
        style={artsyHeaderSectionStyle}
      >
        <div
          className={`profile-header-inner${template === 'artsy' ? ' profile-header-inner--artsy' : ''}`}
        >
          {template === 'artsy' && <ProfileArtsyFlourish />}
          <div
            className="profile-avatar"
            style={{ background: user.avatar_url ? 'transparent' : user.avatarColor }}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="profile-avatar-img" />
            ) : (
              user.initials
            )}
          </div>
          <div className="profile-meta">
            <div className="profile-name-row">
              <h1
                className={`profile-name${template === 'bold' ? ' profile-name--bold-pdf' : ''}${template === 'artsy' ? ' profile-name--artsy-script' : ''}`}
              >
                {template === 'bold' ? user.name.toUpperCase() : user.name}
                {template === 'bold' && (
                  <span className="profile-name-period" aria-hidden>
                    {' '}
                    .
                  </span>
                )}
              </h1>
              {isOwner ? (
                <Link to="/onboarding" className="btn-edit">Edit portfolio</Link>
              ) : user._source === 'supabase' ? (
                <button
                  type="button"
                  className={`btn-follow${following ? ' following' : ''}`}
                  onClick={() => void handleFollowToggle()}
                  disabled={followBusy}
                >
                  {followBusy ? '…' : following ? 'Following ✓' : 'Follow'}
                </button>
              ) : (
                <button type="button" className="btn-follow" disabled>
                  Follow
                </button>
              )}
            </div>
            {followError && (
              <p className="profile-follow-error" role="alert">
                {followError}
              </p>
            )}
            {template === 'bold' ? (
              <>
                {(boldDiscipline || user.location) && (
                <p className="profile-bold-kicker">
                  {boldDiscipline && (
                    <span className="profile-bold-kicker__discipline">
                      {boldDiscipline.toUpperCase()}
                    </span>
                  )}
                  {/* {user.location && (
                    <span className="profile-bold-kicker__loc">
                      {boldDiscipline ? '\u00A0' : ''}
                      {user.location.toUpperCase()}
                    </span>
                  )} */}
                </p>
                )}
                <p className="profile-username profile-username--below-kicker">
                  @{user.username}
                </p>
                <p className="profile-bio profile-bio--bold-pdf">
                  <span className="profile-about-label">ABOUT:</span>
                  {' '}
                  {user.bio}
                </p>
              </>
            ) : template === 'artsy' ? (
              <>
                <p className="profile-artsy-tagline">
                  {user.bio?.trim()
                    ? user.bio
                    : `A portfolio by @${user.username}`}
                </p>
                <p className="profile-username profile-username--artsy">@{user.username}</p>
                {(user.location || user.website) && (
                  <p className="profile-artsy-location-web">
                    {user.location && (
                      <span className="profile-artsy-location-web__item">{user.location}</span>
                    )}
                    {user.location && user.website && (
                      <span className="profile-artsy-location-web__sep" aria-hidden>
                        {' · '}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={site}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-artsy-location-web__link"
                      >
                        {user.website}
                      </a>
                    )}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="profile-username">@{user.username}</p>
                <p className="profile-bio">{user.bio}</p>
              </>
            )}

            {template !== 'bold' && template !== 'artsy' && (
            <div className="profile-details">
              {user.location && (
                <span className="profile-detail">
                  <span>📍</span> {user.location}
                </span>
              )}
              {user.website && (
                <a href={site} target="_blank" rel="noreferrer" className="profile-detail profile-website">
                  <span>🌐</span> {user.website}
                </a>
              )}
            </div>
            )}

            {template === 'bold' && (user.location || user.website) && (
            <div className="profile-details profile-details--bold-inline">
              {user.location && (
                <span className="profile-detail profile-detail--bold-inline">
                  <span className="profile-detail-label">BASED IN</span>
                  <span className="profile-detail-value">{user.location}</span>
                </span>
              )}
              {user.website && (
                <a
                  href={site}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-detail profile-detail--bold-inline profile-website profile-website--bold-inline"
                >
                  <span className="profile-detail-label">WEB</span>
                  <span className="profile-detail-value">{user.website}</span>
                </a>
              )}
            </div>
            )}

            {template !== 'bold' && template !== 'artsy' && (
            <div className="profile-tags">
              {user.tags.map((tag) => (
                <span key={tag} className="profile-tag">{tag}</span>
              ))}
            </div>
            )}

            {template !== 'artsy' && (
            <div className={`profile-stats${template === 'bold' ? ' profile-stats--bold' : ''}`}>
              <div className="profile-stat">
                <span className="profile-stat-value">{workStatCount}</span>
                <span className="profile-stat-label">{workStatLabel}</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{user.followers.toLocaleString()}</span>
                <span className="profile-stat-label">Followers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{user.following.toLocaleString()}</span>
                <span className="profile-stat-label">Following</span>
              </div>
            </div>
            )}
          </div>
          {template === 'artsy' && <ProfileArtsyFlourish mirror />}
        </div>
        {template === 'bold' && (
          <div className="profile-bold-footer" aria-label="Contact">
            {user.website && (
              <a href={site} target="_blank" rel="noreferrer" className="profile-bold-footer__cta">
                GET IN TOUCH
              </a>
            )}
            <button
              type="button"
              className="profile-bold-footer__cta profile-bold-footer__cta--ghost"
              onClick={() => setActiveTab('about')}
            >
              ABOUT THE ARTIST
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div
          className={`profile-content-inner${template === 'artsy' ? ' profile-content-inner--artsy' : ''}`}
        >
          <div className={`profile-tabs${template === 'artsy' ? ' profile-tabs--artsy' : ''}`}>
            <button
              type="button"
              className={`profile-tab${activeTab === 'collections' ? ' active' : ''}`}
              onClick={() => setActiveTab('collections')}
            >
              Collections
            </button>
            <button
              type="button"
              className={`profile-tab${activeTab === 'works' ? ' active' : ''}`}
              onClick={() => setActiveTab('works')}
            >
              Works
            </button>
            <button
              type="button"
              className={`profile-tab${activeTab === 'about' ? ' active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              {template === 'artsy' ? 'Contact' : 'About'}
            </button>
          </div>

          {workDeleteError && (activeTab === 'collections' || activeTab === 'works') && (
            <p className="profile-work-delete-error" role="alert">
              {workDeleteError}
            </p>
          )}

          {activeTab === 'collections' && (
            <PortfolioWorksSection
              key={`rail-collections-${user.username}`}
              layoutRail
              railMode="collections"
              railCollections={railCollections}
              template={template}
              user={user}
              username={user.username}
              isOwner={isOwner}
              onDeleteCollection={onDeleteCollection}
              onDeleteWork={onDeleteWork}
              onRequestAdd={isOwner ? openAddModal : undefined}
            />
          )}

          {activeTab === 'works' && (
            <PortfolioWorksSection
              key={`rail-works-${user.username}`}
              layoutRail
              railMode="works"
              railWorks={railWorks}
              template={template}
              user={user}
              username={user.username}
              isOwner={isOwner}
              onDeleteCollection={onDeleteCollection}
              onDeleteWork={onDeleteWork}
              onRequestAdd={isOwner ? openAddModal : undefined}
            />
          )}

          {activeTab === 'about' && (
            <div className={`profile-about${template === 'artsy' ? ' profile-about--artsy' : ''}`}>
              <div className="about-section">
                <h3>About {user.name}</h3>
                <p>{user.bio}</p>
              </div>
              {user.location && (
                <div className="about-section">
                  <h4>Location</h4>
                  <p>📍 {user.location}</p>
                </div>
              )}
              {user.website && (
                <div className="about-section">
                  <h4>Website</h4>
                  <a href={site} target="_blank" rel="noreferrer">
                    🌐 {user.website}
                  </a>
                </div>
              )}
              <div className="about-section">
                <h4>Disciplines</h4>
                <div className="profile-tags">
                  {user.tags.map((tag) => (
                    <span key={tag} className="profile-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {addOpen && (
        <div className="profile-add-modal-backdrop" role="presentation" onClick={closeAddModal}>
          <div
            className="profile-add-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add to portfolio"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="profile-add-modal__title">Add to portfolio</h3>
            <p className="profile-add-modal__lead">Choose what to add from your profile directly.</p>
            <div className="profile-add-modal__type-row">
              <button
                type="button"
                className={`profile-add-modal__type-btn${addType === 'collection' ? ' active' : ''}`}
                onClick={() => setAddType('collection')}
              >
                Collection
              </button>
              <button
                type="button"
                className={`profile-add-modal__type-btn${addType === 'work' ? ' active' : ''}`}
                onClick={() => setAddType('work')}
              >
                Single work
              </button>
            </div>

            {addType === 'collection' && (
              <div className="profile-add-modal__form">
                <label htmlFor="add-collection-title">Collection name</label>
                <input
                  id="add-collection-title"
                  type="text"
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  placeholder="e.g. Spring 2026"
                />
                <label htmlFor="add-collection-piece-title">First piece title</label>
                <input
                  id="add-collection-piece-title"
                  type="text"
                  value={newCollectionPieceTitle}
                  onChange={(e) => setNewCollectionPieceTitle(e.target.value)}
                  placeholder="Untitled"
                />
                <label htmlFor="add-collection-piece-category">Category</label>
                <select
                  id="add-collection-piece-category"
                  value={newCollectionPieceCategory}
                  onChange={(e) => setNewCollectionPieceCategory(e.target.value)}
                >
                  {categoryChoices.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <label htmlFor="add-collection-piece-file">Media file</label>
                <input
                  id="add-collection-piece-file"
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={(e) => setNewCollectionPieceFile(e.target.files?.[0] || null)}
                />
              </div>
            )}

            {addType === 'work' && (
              <div className="profile-add-modal__form">
                <label htmlFor="add-work-title">Work title</label>
                <input
                  id="add-work-title"
                  type="text"
                  value={newWorkTitle}
                  onChange={(e) => setNewWorkTitle(e.target.value)}
                  placeholder="Untitled"
                />
                <label htmlFor="add-work-category">Category</label>
                <select
                  id="add-work-category"
                  value={newWorkCategory}
                  onChange={(e) => setNewWorkCategory(e.target.value)}
                >
                  {categoryChoices.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <label htmlFor="add-work-file">Media file</label>
                <input
                  id="add-work-file"
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={(e) => setNewWorkFile(e.target.files?.[0] || null)}
                />
              </div>
            )}

            {addError && (
              <p className="profile-add-modal__error" role="alert">{addError}</p>
            )}

            <div className="profile-add-modal__actions">
              <button type="button" className="profile-add-modal__cancel" onClick={closeAddModal}>
                Cancel
              </button>
              <button
                type="button"
                className="profile-add-modal__submit"
                onClick={() => void handleAddPortfolioEntry()}
                disabled={addBusy}
              >
                {addBusy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
