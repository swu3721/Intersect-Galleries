import { useCallback, useEffect, useState } from 'react';
import { fetchSpotifyOEmbed, parseSpotifyTrackId } from '../lib/spotifyTrack';
import './SpotifyCollectionMusicField.css';

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

  return (
    <div
      className={`spotify-field${theme === 'light' ? ' spotify-field--light' : ''} ${className}`.trim()}
    >
      <span className="spotify-field__label" id={`${idPrefix}-label`}>
        Collection music (optional)
      </span>
      <p className="spotify-field__hint" id={`${idPrefix}-hint`}>
        Paste a Spotify track link from the app or web player. It will show as a player on the
        collection page (no Spotify API keys needed).
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
          aria-labelledby={`${idPrefix}-label`}
          aria-describedby={`${idPrefix}-hint`}
        />
        <button type="button" className="spotify-field__btn" onClick={() => void applyPaste()}>
          Use link
        </button>
      </div>

      {localError ? <p className="spotify-field__msg">{localError}</p> : null}
    </div>
  );
}
