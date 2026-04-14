import { Link } from 'react-router-dom';
import { users, featuredArtworks, categories } from '../data/mockData';
import ArtworkCard from '../components/ArtworkCard/ArtworkCard';
import UserCard from '../components/UserCard/UserCard';
import './Home.css';

export default function Home({ currentUser }) {
  const topUsers = [...users].sort((a, b) => b.followers - a.followers).slice(0, 3);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          {featuredArtworks.map((art, i) => (
            <div
              key={art.id}
              className="hero-bg-swatch"
              style={{ background: art.color, '--idx': i }}
            />
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge">Creative Portfolio Network</div>
          <h1 className="hero-title">
            Where portfolios<br />
            <span className="hero-accent">intersect</span>
          </h1>
          <p className="hero-subtitle">
            Share your work. Discover amazing artists. Build your creative community.
          </p>
          <div className="hero-actions">
            {currentUser ? (
              <Link to="/explore" className="btn-primary">Explore Galleries</Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary">Start your portfolio</Link>
                <Link to="/explore" className="btn-ghost">Browse galleries</Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{users.length}+</span>
              <span className="hero-stat-label">Artists</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">
                {users.reduce((s, u) => s + u.artworks.length, 0)}+
              </span>
              <span className="hero-stat-label">Artworks</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">
                {categories.length - 1}+
              </span>
              <span className="hero-stat-label">Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured works</h2>
              <p className="section-subtitle">Handpicked highlights from our community</p>
            </div>
            <Link to="/explore" className="section-link">View all →</Link>
          </div>
          <div className="artworks-grid">
            {featuredArtworks.map(art => (
              <ArtworkCard
                key={art.id}
                artwork={art}
                artistName={art.artistName}
                username={art.username}
                userId={art.userId}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Creators */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Top creators</h2>
              <p className="section-subtitle">The most-followed portfolios on Intersect</p>
            </div>
            <Link to="/explore" className="section-link">See all artists →</Link>
          </div>
          <div className="users-grid">
            {topUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!currentUser && (
        <section className="cta-section">
          <div className="cta-inner">
            <h2 className="cta-title">Ready to share your work?</h2>
            <p className="cta-subtitle">
              Join thousands of artists and showcase your portfolio to the world.
            </p>
            <Link to="/signup" className="btn-primary btn-large">
              Create your portfolio — it's free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
