// Spotify track search (Client Credentials). Secrets: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
// Deploy: supabase functions deploy spotify-search
// Local:  supabase secrets set --env-file supabase/functions/.env  (or Dashboard → Edge Functions → Secrets)

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type TokenCache = { accessToken: string; expiresAtMs: number };
let tokenCache: TokenCache | null = null;

async function getClientAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs > now + 30_000) {
    return tokenCache.accessToken;
  }

  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')?.trim();
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')?.trim();
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not configured for this project.');
  }

  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  const auth = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body,
  });

  if (!res.ok) {
    const t = await res.text();
    console.error('Spotify token error', res.status, t);
    throw new Error('Could not authenticate with Spotify.');
  }

  const json = (await res.json()) as { access_token: string; expires_in?: number };
  const expiresInSec = json.expires_in ?? 3600;
  tokenCache = {
    accessToken: json.access_token,
    expiresAtMs: now + expiresInSec * 1000,
  };
  return tokenCache.accessToken;
}

type SpotifyTrack = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  imageUrl: string | null;
};

function mapSpotifySearch(json: unknown): SpotifyTrack[] {
  const root = json as {
    tracks?: { items?: Array<Record<string, unknown>> };
  };
  const items = root?.tracks?.items ?? [];
  return items.map((t) => {
    const rawArtists = Array.isArray(t.artists) ? (t.artists as { name?: string }[]) : [];
    const artists = rawArtists
      .map((a) => (typeof a.name === 'string' ? a.name.trim() : ''))
      .filter((n) => n.length > 0);
    const album = (t.album as { name?: string; images?: { url?: string }[] } | undefined) ?? {};
    const images = album.images ?? [];
    const imageUrl =
      images.find((im) => im.url && im.url.length > 0)?.url ??
      images[images.length - 1]?.url ??
      null;
    return {
      id: String(t.id ?? ''),
      name: String(t.name ?? 'Untitled'),
      artists,
      album: String(album.name ?? ''),
      imageUrl,
    };
  }).filter((t) => t.id.length === 22);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    let q = '';
    try {
      const body = (await req.json()) as { q?: string };
      q = String(body?.q ?? '').trim();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (q.length < 2) {
      return new Response(JSON.stringify({ tracks: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (q.length > 120) {
      q = q.slice(0, 120);
    }

    const accessToken = await getClientAccessToken();
    const params = new URLSearchParams({
      q,
      type: 'track',
      limit: '10',
    });
    const searchRes = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!searchRes.ok) {
      const t = await searchRes.text();
      console.error('Spotify search error', searchRes.status, t);
      return new Response(
        JSON.stringify({
          error: 'Spotify search failed.',
          spotify_status: searchRes.status,
          spotify_body: t.slice(0, 400),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const raw = await searchRes.json();
    const tracks = mapSpotifySearch(raw);
    return new Response(JSON.stringify({ tracks }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    console.error(e);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
