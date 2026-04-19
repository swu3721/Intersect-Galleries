import { Link } from 'react-router-dom';
import './UserCard.css';

export default function UserCard({ user }) {
  const topArtworks = user.artworks.slice(0, 3);

  return (
    <Link to={`/profile/${user.username}`} className="user-card">
      <div
        className="user-card-cover"
        style={{
          background: user.cover_image_url ? '#0a0a0f' : user.coverColor,
          backgroundImage: user.cover_image_url ? `url(${user.cover_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!user.cover_image_url && topArtworks.map((art, i) => (
          <div
            key={art.id}
            className="cover-preview"
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
      <div className="user-card-body">
        <div
          className="user-card-avatar"
          style={{ background: user.avatar_url ? 'transparent' : user.avatarColor }}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="user-card-avatar-img" />
          ) : (
            user.initials
          )}
        </div>
        <div className="user-card-info">
          <h3 className="user-card-name">{user.name}</h3>
          <p className="user-card-username">@{user.username}</p>
          <p className="user-card-bio">{user.bio}</p>
          <div className="user-card-tags">
            {user.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="user-tag">{tag}</span>
            ))}
          </div>
          <div className="user-card-stats">
            <span>{user.artworks.length} works</span>
            <span>•</span>
            <span>{user.followers.toLocaleString()} followers</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
