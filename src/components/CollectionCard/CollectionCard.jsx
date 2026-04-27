import { Link } from 'react-router-dom';
import './CollectionCard.css';

export default function CollectionCard({
  collection,
  username,
  minimal = false,
  onDelete,
  /** Onboarding previews: no navigation */
  previewMode = false,
}) {
  const { title, coverUrl, coverColor, pieceCount, hasAudio } = collection;
  const to = `/profile/${username}/collection/${collection.id}`;

  const thumb = (
    <div
      className={`collection-card__thumb${!coverUrl ? ' collection-card__thumb--empty' : ''}`}
      style={{
        backgroundColor: coverColor,
        ...(coverUrl
          ? {
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}),
      }}
      aria-hidden={!coverUrl}
    >
      {onDelete && (
        <button
          type="button"
          className="collection-card__delete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Remove collection ${title}`}
        >
          Remove
        </button>
      )}
      {hasAudio && (
        <span className="collection-card__audio-badge" title="Has soundtrack">
          ♪
        </span>
      )}
    </div>
  );

  const meta = (
    <div className="collection-card__meta">
      <p className="collection-card__title">{title}</p>
      <p className="collection-card__count">
        {pieceCount === 1 ? '1 piece' : `${pieceCount} pieces`}
      </p>
    </div>
  );

  if (previewMode) {
    return (
      <div
        className={`collection-card${minimal ? ' collection-card--minimal' : ''}`}
      >
        {thumb}
        {meta}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`collection-card${minimal ? ' collection-card--minimal' : ''}`}
    >
      {thumb}
      {meta}
    </Link>
  );
}
