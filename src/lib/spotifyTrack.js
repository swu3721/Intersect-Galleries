/**
 * Extract a Spotify track ID from paste text, a spotify: URI, or a bare 22-char id.
 * @param {string} input
 * @returns {string | null}
 */
export function parseSpotifyTrackId(input) {
  const s = String(input || '').trim();
  if (!s) return null;

  const uri = /^spotify:track:([a-zA-Z0-9]{22})$/i.exec(s);
  if (uri) return uri[1];

  const normalized = s.replace(/^https?:\/\//i, '');
  const pathMatch =
    /open\.spotify\.com(?:\/[\w-]+)?\/track\/([a-zA-Z0-9]{22})(?:[/?#]|$)/i.exec(
      normalized,
    );
  if (pathMatch) return pathMatch[1];

  if (/^[a-zA-Z0-9]{22}$/.test(s)) return s;
  return null;
}

/**
 * @param {string} trackId
 * @returns {Promise<{ title?: string, thumbnail_url?: string } | null>}
 */
export async function fetchSpotifyOEmbed(trackId) {
  if (!trackId) return null;
  const trackUrl = `https://open.spotify.com/track/${trackId}`;
  const r = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(trackUrl)}`,
  );
  if (!r.ok) return null;
  return r.json();
}
