import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSpotifyOEmbed, parseSpotifyTrackId } from '../lib/spotifyTrack';
import { searchSpotifyTracks } from '../lib/spotifySearch';
import './SpotifyCollectionMusicField.css';

const SEARCH_DEBOUNCE_MS = 400;

/**
 * @param {{ trackId: string | null, onTrackIdChange: (id: string | null) => void, idPrefix?: string, className?: string, theme?: 'light' | 'dark' }} props
 */
export default function SpotifyCollectionMusicField({
  trackId,
  onTrackIdChange,
  idPrefix = 'spotify-field',
  className = '',
  theme = 'dark',
}) {
  const [paste, setPaste] = useState('');
  const [localError, setLocalError] = useState('');
  const [oembed, setOembed] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchDebounceRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!trackId) {
        setOembed(null);
        return;
      }
      const o = await fetchSpotifyOEmbed(trackId);
      if (!cancelled) setOembed(o);
    })();
    return () => {
      cancelled = true;
    };
  }, [trackId]);

  const onSearchInputChange = useCallback((value) => {
    setSearchInput(value);
    window.clearTimeout(searchDebounceRef.current);
    const t = value.trim();
    if (t.length < 2) {
      setDebouncedQuery('');
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError('');
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    searchDebounceRef.current = window.setTimeout(() => {
      setDebouncedQuery(t);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) return undefined;

    let cancelled = false;
    (async () => {
      const { tracks, error } = await searchSpotifyTracks(q);
      if (cancelled) return;
      setSearchLoading(false);
      if (error) {
        setSearchResults([]);
        setSearchError(error);
        return;
      }
      setSearchResults(tracks);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const applyPaste = useCallback(() => {
    setLocalError('');
    const id = parseSpotifyTrackId(paste);
    if (!id) {
      setLocalError('Paste a Spotify track link (open.spotify.com/track/…) or a spotify:track: URI.');
      return;
    }
    onTrackIdChange(id);
    setPaste('');
  }, [paste, onTrackIdChange]);

  const pickSearchTrack = useCallback(
    (id) => {
      window.clearTimeout(searchDebounceRef.current);
      onTrackIdChange(id);
      setSearchInput('');
      setDebouncedQuery('');
      setSearchResults([]);
      setSearchError('');
      setSearchLoading(false);
    },
    [onTrackIdChange],
  );

  const showSearchEmpty =
    !searchLoading &&
    debouncedQuery.trim().length >= 2 &&
    searchResults.length === 0 &&
    !searchError;

  return (
    <div
      className={`spotify-field${theme === 'light' ? ' spotify-field--light' : ''} ${className}`.trim()}
    >
      <span className="spotify-field__label" id={`${idPrefix}-label`}>
        Collection music (optional)
      </span>
      <p className="spotify-field__hint" id={`${idPrefix}-hint`}>
        Search Spotify to quickly find a track, or paste a Spotify URL manually.
      </p>

      {trackId && (
        <div className="spotify-field__selected">
          {oembed?.thumbnail_url ? (
            <img
              className="spotify-field__selected-thumb"
              src={oembed.thumbnail_url}
              alt=""
            />
          ) : (
            <span className="spotify-field__selected-thumb" aria-hidden />
          )}
          <div className="spotify-field__selected-meta">
            <p className="spotify-field__selected-title">
              {oembed?.title || `Track ${trackId}`}
            </p>
          </div>
          <button
            type="button"
            className="spotify-field__btn spotify-field__btn--ghost"
            onClick={() => onTrackIdChange(null)}
          >
            Remove
          </button>
        </div>
      )}

      <div className="spotify-field__search-block">
        <span className="spotify-field__sub-label" id={`${idPrefix}-search-label`}>
          Search tracks
        </span>
        <div className="spotify-field__row spotify-field__row--search">
          <input
            id={`${idPrefix}-search`}
            className="spotify-field__input"
            type="search"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Artist or song name…"
            autoComplete="off"
            aria-labelledby={`${idPrefix}-search-label`}
          />
          {searchLoading ? (
            <span className="spotify-field__search-status" aria-live="polite">
              Searching…
            </span>
          ) : null}
        </div>
        {searchError ? <p className="spotify-field__msg spotify-field__msg--search">{searchError}</p> : null}
        {showSearchEmpty ? <p className="spotify-field__search-empty">No tracks found.</p> : null}
        {searchResults.length > 0 ? (
          <ul className="spotify-field__results" role="listbox" aria-label="Spotify search results">
            {searchResults.map((t) => (
              <li key={t.id} className="spotify-field__result">
                <button
                  type="button"
                  className="spotify-field__result-btn"
                  onClick={() => pickSearchTrack(t.id)}
                >
                  {t.imageUrl ? (
                    <img className="spotify-field__result-thumb" src={t.imageUrl} alt="" />
                  ) : (
                    <span className="spotify-field__result-thumb spotify-field__result-thumb--empty" />
                  )}
                  <span className="spotify-field__result-text">
                    <span className="spotify-field__result-title">{t.name}</span>
                    <span className="spotify-field__result-meta">
                      {(t.artists || []).join(', ')}
                      {t.album ? ` · ${t.album}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <span className="spotify-field__sub-label" id={`${idPrefix}-paste-label`}>
        Or paste a link
      </span>
      <div className="spotify-field__row">
        <input
          id={`${idPrefix}-paste`}
          className="spotify-field__input"
          type="url"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              applyPaste();
            }
          }}
          placeholder="Paste Spotify track URL…"
          aria-labelledby={`${idPrefix}-paste-label`}
        />
        <button type="button" className="spotify-field__btn" onClick={() => void applyPaste()}>
          Use link
        </button>
      </div>

      {localError ? <p className="spotify-field__msg">{localError}</p> : null}
    </div>
  );
}
