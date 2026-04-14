import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { users } from '../data/mockData';
import ArtworkCard from '../components/ArtworkCard/ArtworkCard';
import './Profile.css';

export default function Profile({ currentUser }) {
  const { username } = useParams();
  const user = users.find(u => u.username === username);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('works');

  if (!user) {
    return (
      <div className="profile-not-found">
        <h2>User not found</h2>
        <p>The profile <strong>@{username}</strong> doesn't exist.</p>
        <Link to="/explore" className="btn-primary">Browse artists</Link>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.username === user.username;
  const followerCount = user.followers + (following ? 1 : 0);

  return (
    <div className="profile">
      {/* Cover */}
      <div className="profile-cover" style={{ background: user.coverColor }}>
        <div className="profile-cover-artworks">
          {user.artworks.slice(0, 5).map((art, i) => (
            <div
              key={art.id}
              className="cover-art-strip"
              style={{ background: art.color, '--i': i }}
            />
          ))}
        </div>
      </div>

      {/* Profile header */}
      <div className="profile-header-section">
        <div className="profile-header-inner">
          <div className="profile-avatar" style={{ background: user.avatarColor }}>
            {user.initials}
          </div>
          <div className="profile-meta">
            <div className="profile-name-row">
              <h1 className="profile-name">{user.name}</h1>
              {isOwner ? (
                <button className="btn-edit">Edit profile</button>
              ) : (
                <button
                  className={`btn-follow${following ? ' following' : ''}`}
                  onClick={() => setFollowing(!following)}
                >
                  {following ? 'Following ✓' : 'Follow'}
                </button>
              )}
            </div>
            <p className="profile-username">@{user.username}</p>
            <p className="profile-bio">{user.bio}</p>

            <div className="profile-details">
              {user.location && (
                <span className="profile-detail">
                  <span>📍</span> {user.location}
                </span>
              )}
              {user.website && (
                <a href={`https://${user.website}`} target="_blank" rel="noreferrer" className="profile-detail profile-website">
                  <span>🌐</span> {user.website}
                </a>
              )}
            </div>

            <div className="profile-tags">
              {user.tags.map(tag => (
                <span key={tag} className="profile-tag">{tag}</span>
              ))}
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{user.artworks.length}</span>
                <span className="profile-stat-label">Works</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{followerCount.toLocaleString()}</span>
                <span className="profile-stat-label">Followers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{user.following.toLocaleString()}</span>
                <span className="profile-stat-label">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="profile-content">
        <div className="profile-content-inner">
          <div className="profile-tabs">
            <button
              className={`profile-tab${activeTab === 'works' ? ' active' : ''}`}
              onClick={() => setActiveTab('works')}
            >
              Works
            </button>
            <button
              className={`profile-tab${activeTab === 'about' ? ' active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>

          {activeTab === 'works' && (
            <div className="profile-artworks">
              {user.artworks.map(art => (
                <ArtworkCard
                  key={art.id}
                  artwork={art}
                  username={user.username}
                />
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="profile-about">
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
                  <a href={`https://${user.website}`} target="_blank" rel="noreferrer">
                    🌐 {user.website}
                  </a>
                </div>
              )}
              <div className="about-section">
                <h4>Disciplines</h4>
                <div className="profile-tags">
                  {user.tags.map(tag => (
                    <span key={tag} className="profile-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
