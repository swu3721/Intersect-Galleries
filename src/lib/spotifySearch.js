import { supabase } from './supabase';

/**
 * @typedef {{ id: string, name: string, artists: string[], album: string, imageUrl: string | null }} SpotifySearchTrack
 */

/**
 * Search tracks via Supabase Edge Function `spotify-search` (Spotify Client Credentials).
 * @param {string} query
 * @returns {Promise<{ tracks: SpotifySearchTrack[], error: string | null }>}
 */
export async function searchSpotifyTracks(query) {
  const q = String(query || '').trim();
  if (q.length < 2) {
    return { tracks: [], error: null };
  }

  const { data, error } = await supabase.functions.invoke('spotify-search', {
    body: { q },
  });

  if (error) {
    return {
      tracks: [],
      error: error.message || 'Search request failed.',
    };
  }

  if (data && typeof data === 'object' && 'error' in data && data.error) {
    return {
      tracks: [],
      error: String(data.error),
    };
  }

  const tracks = Array.isArray(data?.tracks) ? data.tracks : [];
  return { tracks, error: null };
}
