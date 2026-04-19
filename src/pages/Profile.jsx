import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { users } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  fetchProfileByUsername,
  mapProfileRowsToViewModel,
} from '../lib/supabaseProfiles';
import { PortfolioWorksSection } from '../components/portfolioTemplates/PortfolioLayouts';
import './Profile.css';

function websiteHref(website) {
  const w = String(website || '').trim();
  if (!w) return '';
  if (/^https?:\/\//i.test(w)) return w;
  return `https://${w}`;
}

export default function Profile() {
  const { username } = useParams();
  const { session, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('works');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const uname = String(username).toLowerCase().trim();
      try {
        const row = await fetchProfileByUsername(uname);
        if (cancelled) return;
        if (row) {
          setUser(mapProfileRowsToViewModel(row.profile, row.items));
        } else {
          const mock = users.find((u) => u.username === uname);
          setUser(
            mock
              ? {
                  ...mock,
                  portfolio_template: mock.portfolio_template || 'grid',
                  _source: 'mock',
                }
              : null,
          );
        }
      } catch (e) {
        console.error(e);
        const mock = users.find((u) => u.username === uname);
        if (!cancelled) {
          setUser(
            mock
              ? {
                  ...mock,
                  portfolio_template: mock.portfolio_template || 'grid',
                  _source: 'mock',
                }
              : null,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const isOwner = useMemo(() => {
    if (!user) return false;
    if (user._source === 'supabase' && session?.user?.id === user.id) return true;
    if (user._source === 'mock' && currentUser?.username === user.username) return true;
    return false;
  }, [user, session?.user?.id, currentUser?.username]);

  const template = user?.portfolio_template || 'grid';
  const site = user ? websiteHref(user.website) : '';

  if (loading) {
    return (
      <div className="profile-loading" role="status">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-not-found">
        <h2>User not found</h2>
        <p>
          The profile <strong>@{username}</strong> doesn&apos;t exist.
        </p>
        <Link to="/explore" className="btn-primary">Browse artists</Link>
      </div>
    );
  }

  const followerCount = user.followers + (following ? 1 : 0);

  return (
    <div className="profile">
      <div
        className="profile-cover"
        style={{
          background: user.cover_image_url ? '#0a0a0f' : user.coverColor,
          backgroundImage: user.cover_image_url ? `url(${user.cover_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!user.cover_image_url && (
          <div className="profile-cover-artworks">
            {user.artworks.slice(0, 5).map((art, i) => (
              <div
                key={art.id}
                className="cover-art-strip"
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
        )}
      </div>

      <div className="profile-header-section">
        <div className="profile-header-inner">
          <div
            className="profile-avatar"
            style={{ background: user.avatar_url ? 'transparent' : user.avatarColor }}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="profile-avatar-img" />
            ) : (
              user.initials
            )}
          </div>
          <div className="profile-meta">
            <div className="profile-name-row">
              <h1 className="profile-name">{user.name}</h1>
              {isOwner ? (
                <Link to="/onboarding" className="btn-edit">Edit portfolio</Link>
              ) : (
                <button
                  type="button"
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
                <a href={site} target="_blank" rel="noreferrer" className="profile-detail profile-website">
                  <span>🌐</span> {user.website}
                </a>
              )}
            </div>

            <div className="profile-tags">
              {user.tags.map((tag) => (
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

      <div className="profile-content">
        <div className="profile-content-inner">
          <div className="profile-tabs">
            <button
              type="button"
              className={`profile-tab${activeTab === 'works' ? ' active' : ''}`}
              onClick={() => setActiveTab('works')}
            >
              Works
            </button>
            <button
              type="button"
              className={`profile-tab${activeTab === 'about' ? ' active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>

          {activeTab === 'works' && (
            <PortfolioWorksSection
              template={template}
              user={user}
              username={user.username}
              isOwner={isOwner}
            />
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
                  <a href={site} target="_blank" rel="noreferrer">
                    🌐 {user.website}
                  </a>
                </div>
              )}
              <div className="about-section">
                <h4>Disciplines</h4>
                <div className="profile-tags">
                  {user.tags.map((tag) => (
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
