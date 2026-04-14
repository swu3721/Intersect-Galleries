import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ArtworkCard.css';

export default function ArtworkCard({ artwork, artistName, username, mini }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(artwork.likes || 0);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      setLikeCount(c => c - 1);
    } else {
      setLikeCount(c => c + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className={`artwork-card${mini ? ' artwork-card--mini' : ''}`}>
      <div
        className="artwork-thumbnail"
        style={{ background: artwork.color }}
        aria-label={artwork.title}
      >
        <div className="artwork-overlay">
          <span className="artwork-category">{artwork.category}</span>
        </div>
      </div>
      <div className="artwork-footer">
        <div className="artwork-meta">
          <p className="artwork-title">{artwork.title}</p>
          {artistName && (
            <Link to={`/profile/${username}`} className="artwork-artist" onClick={e => e.stopPropagation()}>
              @{username}
            </Link>
          )}
        </div>
        <button
          className={`like-btn${liked ? ' liked' : ''}`}
          onClick={handleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <span className="like-icon">{liked ? '♥' : '♡'}</span>
          <span className="like-count">{likeCount}</span>
        </button>
      </div>
    </div>
  );
}
