import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPublicCollection } from '../lib/supabaseProfiles';
import { getPortfolioPublicUrl } from '../lib/storage';
import { coverColorFromSeed } from '../lib/userDisplay';
import { normalizePortfolioTemplate } from '../lib/portfolioTemplate';
import { users } from '../data/mockData';
import './CollectionView.css';

function enrichMockUserForCollectionView(mock) {
  const artworks = mock.artworks ?? [];
  const pieces = artworks.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    media_type: a.media_type || 'image',
    mediaUrl: a.mediaUrl || null,
    color: a.color,
  }));
  return {
    profile: {
      username: mock.username,
      display_name: mock.name,
      portfolio_template: mock.portfolio_template || 'minimalist',
      cover_image_url: mock.cover_image_url ?? null,
      cover_color: mock.coverColor ?? null,
      id: mock.id,
    },
    collection: {
      id: `mock-${mock.username}`,
      title: 'Works',
      spotify_track_id: null,
    },
    items: pieces.map((p, i) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      media_type: p.media_type,
      storage_path: null,
      sort_order: i,
    })),
    pieceMediaById: Object.fromEntries(
      pieces.filter((p) => p.mediaUrl).map((p) => [p.id, p.mediaUrl]),
    ),
  };
}

export default function CollectionView() {
  const { username, collectionId } = useParams();
  const navigate = useNavigate();
  const stripRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [spotifyTrackId, setSpotifyTrackId] = useState(null);
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      const uname = String(username).toLowerCase().trim();
      try {
        const row = await fetchPublicCollection(uname, collectionId);
        if (cancelled) return;
        if (row) {
          setProfile(row.profile);
          setCollectionTitle(row.collection.title || 'Collection');
          setSpotifyTrackId(row.collection.spotify_track_id || null);
          const ordered = [...(row.items ?? [])].sort(
            (a, b) => a.sort_order - b.sort_order,
          );
          setPieces(
            ordered.map((it) => ({
              id: it.id,
              title: it.title,
              media_type: it.media_type,
              mediaUrl: getPortfolioPublicUrl(it.storage_path),
            })),
          );
          return;
        }

        const mock = users.find((u) => u.username === uname);
        if (
          mock
          && (collectionId === `mock-${uname}` || collectionId.startsWith('mock-'))
        ) {
          const bundle = enrichMockUserForCollectionView(mock);
          if (cancelled) return;
          setProfile(bundle.profile);
          setCollectionTitle(bundle.collection.title);
          setSpotifyTrackId(bundle.collection.spotify_track_id || null);
          const ordered = [...(bundle.items ?? [])].sort(
            (a, b) => a.sort_order - b.sort_order,
          );
          setPieces(
            ordered.map((it) => ({
              id: it.id,
              title: it.title,
              media_type: it.media_type,
              mediaUrl: bundle.pieceMediaById[it.id] || null,
            })),
          );
          return;
        }

        if (!cancelled) {
          setProfile(null);
          setSpotifyTrackId(null);
          setPieces([]);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e.message || 'Could not load collection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, collectionId]);

  const goNeighbor = useCallback((dir) => {
    const el = stripRef.current;
    if (!el || !pieces.length) return;
    const w = el.clientWidth;
    const i = Math.round(el.scrollLeft / w);
    const next = Math.max(0, Math.min(pieces.length - 1, i + dir));
    el.scrollTo({ left: next * w, behavior: 'smooth' });
  }, [pieces.length]);

  const template = normalizePortfolioTemplate(profile?.portfolio_template);
  const artsyHeaderStyle = useMemo(() => {
    if (template !== 'artsy' || !profile) return undefined;
    if (profile.cover_image_url) {
      const u = JSON.stringify(profile.cover_image_url);
      return {
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0) 26%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.72) 76%, #ffffff 100%), url(${u})`,
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
      };
    }
    const raw = profile.cover_color != null ? String(profile.cover_color).trim() : '';
    const fallback = raw || coverColorFromSeed(profile.id);
    return {
      backgroundImage: `linear-gradient(to bottom, ${fallback} 0%, rgba(255,255,255,0.55) 48%, #ffffff 100%)`,
    };
  }, [template, profile]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNeighbor(1);
      if (e.key === 'ArrowLeft') goNeighbor(-1);
      if (e.key === 'Escape') navigate(`/profile/${username}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNeighbor, navigate, username]);

  if (loading) {
    return (
      <div className="collection-view collection-view--loading" role="status">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="collection-view collection-view--error">
        <p>{error}</p>
        <Link to="/explore">Browse artists</Link>
      </div>
    );
  }

  if (!profile || pieces.length === 0) {
    return (
      <div className="collection-view collection-view--error">
        <h2>Collection not found</h2>
        <Link to={username ? `/profile/${username}` : '/'}>Back to profile</Link>
      </div>
    );
  }

  return (
    <div className={`collection-view collection-view--tpl-${template}`}>
      <header
        className={`collection-view__header${template === 'artsy' ? ' collection-view__header--artsy' : ''}`}
        style={template === 'artsy' ? artsyHeaderStyle : undefined}
      >
        <button
          type="button"
          className="collection-view__back"
          onClick={() => navigate(`/profile/${profile.username}`)}
        >
          ← Back
        </button>
        <div className="collection-view__titles">
          <h1 className="collection-view__title">{collectionTitle}</h1>
          <p className="collection-view__artist">
            {profile.display_name ? (
              <span className="collection-view__display-name">{profile.display_name}</span>
            ) : null}
            {profile.display_name ? (
              <>
                {' '}
                <span className="collection-view__artist-sep" aria-hidden="true">
                  ·
                </span>{' '}
              </>
            ) : null}
            @{profile.username}
          </p>
        </div>
      </header>

      {spotifyTrackId ? (
        <div className="collection-view__spotify-wrap">
          <iframe
            title={`Spotify — ${collectionTitle}`}
            className="collection-view__spotify"
            src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : null}

      <div ref={stripRef} className="collection-view__strip" tabIndex={0}>
        {pieces.map((p) => (
          <section
            key={p.id}
            className="collection-view__slide"
            aria-label={p.title}
          >
            <div className="collection-view__media-wrap">
              {p.media_type === 'video' && p.mediaUrl ? (
                <video
                  className="collection-view__media"
                  src={p.mediaUrl}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : p.mediaUrl ? (
                <img
                  className="collection-view__media"
                  src={p.mediaUrl}
                  alt={p.title}
                />
              ) : (
                <div className="collection-view__placeholder">{p.title}</div>
              )}
            </div>
            <footer className="collection-view__slide-caption">
              <span className="collection-view__slide-title">{p.title}</span>
            </footer>
          </section>
        ))}
      </div>

      <p className="collection-view__hint">Swipe horizontally · ← → keys</p>
    </div>
  );
}
