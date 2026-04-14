import { Link } from 'react-router-dom';
import './Home.css';

const demoArtists = [
  {
    id: '1',
    name: 'Maya Chen',
    discipline: 'Digital Collage',
    location: 'Brooklyn, NY',
    coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=800&fit=crop',
  },
  {
    id: '2',
    name: 'Jordan Rivers',
    discipline: 'Photography',
    location: 'Manhattan, NY',
    coverImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop',
  },
  {
    id: '3',
    name: 'Aria Blackwood',
    discipline: 'Mixed Media',
    location: 'Chelsea, NY',
    coverImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=800&fit=crop',
  },
  {
    id: '4',
    name: 'Kai Martinez',
    discipline: 'Sculpture',
    location: 'Bushwick, NY',
    coverImage: 'https://images.unsplash.com/photo-1545898679-1d5a6a6b29d0?w=1200&h=800&fit=crop',
  },
  {
    id: '5',
    name: 'Zoe Park',
    discipline: 'Painting',
    location: 'Lower East Side, NY',
    coverImage: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&h=800&fit=crop',
  },
  {
    id: '6',
    name: 'River Stone',
    discipline: 'Installation',
    location: 'DUMBO, NY',
    coverImage: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&h=800&fit=crop',
  },
  {
    id: '7',
    name: 'Niko Ash',
    discipline: 'Abstract Art',
    location: 'Williamsburg, NY',
    coverImage: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=1200&h=800&fit=crop',
  },
  {
    id: '8',
    name: 'Sage Monroe',
    discipline: 'Performance Art',
    location: 'Red Hook, NY',
    coverImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=800&fit=crop',
  },
  {
    id: '9',
    name: 'Atlas Cruz',
    discipline: 'Urban Art',
    location: 'East Village, NY',
    coverImage: 'https://images.unsplash.com/photo-1561998338-13ad7883b21f?w=1200&h=800&fit=crop',
  },
];

export default function Home({ currentUser }) {
  const featuredArtists = demoArtists.slice(0, 6);
  const allArtists = demoArtists.slice(6);

  return (
    <div className="home-demo">
      <section className="demo-hero">
        <div className="demo-hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1920&h=1080&fit=crop"
          alt="Gallery"
          className="demo-hero-image"
        />
        <div className="demo-hero-content">
          <h1>
            DISCOVER
            <br />
            ARTISTS
          </h1>
          <p>A curated platform for contemporary creators pushing boundaries</p>
          {!currentUser && (
            <Link to="/signup" className="demo-hero-cta">CREATE PORTFOLIO</Link>
          )}
        </div>
      </section>

      <section className="featured-section">
        <div className="demo-wrap">
          <div className="section-intro">
            <h2>FEATURED</h2>
            <p>Curated selection of contemporary talent</p>
          </div>
          <div className="featured-grid">
            {featuredArtists.map((artist, index) => (
              <article key={artist.id} className={`featured-card${index % 2 === 1 ? ' staggered' : ''}`}>
                <Link to="/explore" className="featured-image-wrap">
                  <img src={artist.coverImage} alt={artist.name} className="featured-image" />
                  <span className="featured-overlay-text">View Portfolio →</span>
                </Link>
                <div className="featured-meta">
                  <h3>{artist.name}</h3>
                  <p className="discipline">{artist.discipline}</p>
                  <p className="location">{artist.location}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="all-artists-section">
        <div className="demo-wrap">
          <div className="section-intro">
            <h2>ALL ARTISTS</h2>
            <p>Browse the complete collection</p>
          </div>
          <div className="all-grid">
            {allArtists.map((artist) => (
              <article key={artist.id} className="all-card">
                <Link to="/explore" className="all-image-wrap">
                  <img src={artist.coverImage} alt={artist.name} className="all-image" />
                </Link>
                <div className="all-meta">
                  <h4>{artist.name}</h4>
                  <p>{artist.discipline}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
