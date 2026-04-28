import { Link } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { fetchProfilesForExplore } from '../lib/supabaseProfiles';
import './Home.css';

const demoArtists = [
  {
    id: '1',
    name: 'Maya Chen',
    discipline: 'Digital Collage',
    location: 'Brooklyn, NY',
    coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=800&fit=crop',
    link: '/explore',
  },
  {
    id: '2',
    name: 'Jordan Rivers',
    discipline: 'Photography',
    location: 'Manhattan, NY',
    coverImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=800&fit=crop',
    link: '/explore',
  },
  {
    id: '3',
    name: 'Aria Blackwood',
    discipline: 'Mixed Media',
    location: 'Chelsea, NY',
    coverImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=800&fit=crop',
    link: '/explore',
  },
  {
    id: '4',
    name: 'Kai Martinez',
    discipline: 'Sculpture',
    location: 'Bushwick, NY',
    coverImage: 'https://images.unsplash.com/photo-1545898679-1d5a6a6b29d0?w=1200&h=800&fit=crop',
    link: '/explore',
  },
  {
    id: '5',
    name: 'Zoe Park',
    discipline: 'Painting',
    location: 'Lower East Side, NY',
    coverImage: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&h=800&fit=crop',
    link: '/explore',
  },
  {
    id: '6',
    name: 'River Stone',
    discipline: 'Installation',
    location: 'DUMBO, NY',
    coverImage: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&h=800&fit=crop',
    link: '/explore',
  },
  {
    id: '7',
    name: 'Niko Ash',
    discipline: 'Abstract Art',
    location: 'Williamsburg, NY',
    coverImage: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=1200&h=800&fit=crop',
    link: '/explore',
  },
  {
    id: '8',
    name: 'Sage Monroe',
    discipline: 'Performance Art',
    location: 'Red Hook, NY',
    coverImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=800&fit=crop',
    link: '/explore',
  },
  {
    id: '9',
    name: 'Atlas Cruz',
    discipline: 'Urban Art',
    location: 'East Village, NY',
    coverImage: 'https://images.unsplash.com/photo-1561998338-13ad7883b21f?w=1200&h=800&fit=crop',
    link: '/explore',
  },
];

function mapProfileToHomeArtist(p, index) {
  const coverFallback =
    p.cover_image_url ||
    p.artworks?.[0]?.mediaUrl ||
    demoArtists[index % demoArtists.length].coverImage;
  return {
    id: `db-${p.id}`,
    name: p.name,
    discipline: p.tags?.[0] || 'Portfolio',
    location: p.location || 'On Intersect',
    coverImage: coverFallback,
    link: `/profile/${p.username}`,
  };
}

const featuredEase = [0.16, 1, 0.3, 1];
const featuredScaleEase = [0.34, 1.56, 0.64, 1];
const heroEase = [0.22, 1, 0.36, 1];
const imageHoverEase = [0.22, 1, 0.36, 1];

export default function Home() {
  const { currentUser } = useAuth();
  const [remote, setRemote] = useState([]);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroX = useTransform(scrollYProgress, [0, 1], [0, -800]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    let cancelled = false;
    fetchProfilesForExplore(12).then((list) => {
      if (!cancelled) setRemote(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { featuredArtists, allArtists } = useMemo(() => {
    const fromDb = remote.map((p, i) => mapProfileToHomeArtist(p, i));
    if (fromDb.length >= 6) {
      return {
        featuredArtists: fromDb.slice(0, 6),
        allArtists: [...fromDb.slice(6), ...demoArtists],
      };
    }
    const fillerCount = Math.max(0, 6 - fromDb.length);
    return {
      featuredArtists: [...fromDb, ...demoArtists.slice(0, fillerCount)],
      allArtists: demoArtists.slice(fillerCount),
    };
  }, [remote]);

  return (
    <div className="home-demo">
      <section ref={heroRef} className="demo-hero">
        <div className="demo-hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1920&h=1080&fit=crop"
          alt="Gallery"
          className="demo-hero-image"
        />
        <div className="demo-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: heroEase }}
            style={{ x: heroX, opacity: heroOpacity }}
          >
            <img
              src="/intersect-logo.jpeg"
              alt=""
              className="demo-hero-logo"
            />
            <h1>
              DISCOVER
              <br />
              ARTISTS
            </h1>
            <p>A curated platform for contemporary creators pushing boundaries</p>
          </motion.div>
          {!currentUser && (
            <motion.div
              className="demo-hero-cta-wrap"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: heroEase }}
            >
              <Link to="/signup" className="demo-hero-cta">CREATE PORTFOLIO</Link>
            </motion.div>
          )}
        </div>
      </section>

      <section className="featured-section">
        <div className="demo-wrap">
          <motion.div
            className="section-intro"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>FEATURED</h2>
            <p>Curated selection of contemporary talent</p>
          </motion.div>
          <div className="featured-grid">
            {featuredArtists.map((artist, index) => (
              <motion.article
                key={artist.id}
                className={`featured-card${index % 2 === 1 ? ' staggered' : ''}`}
                initial={{ opacity: 0, y: 120, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px', amount: 0.2 }}
                transition={{
                  duration: 0.8,
                  ease: featuredEase,
                  delay: index * 0.15,
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.6, ease: featuredScaleEase },
                }}
              >
                <Link to={artist.link || '/explore'} className="featured-card-link">
                  <motion.div
                    className="featured-image-wrap"
                    whileHover={{ scale: 0.98 }}
                    transition={{ duration: 0.6, ease: imageHoverEase }}
                  >
                    <img src={artist.coverImage} alt={artist.name} className="featured-image" />
                    <span className="featured-overlay-text">View Portfolio →</span>
                  </motion.div>
                  <div className="featured-meta">
                    <h3>{artist.name}</h3>
                    <p className="discipline">{artist.discipline}</p>
                    <p className="location">{artist.location}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="all-artists-section">
        <div className="demo-wrap">
          <motion.div
            className="section-intro"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>ALL ARTISTS</h2>
            <p>Browse the complete collection</p>
          </motion.div>
          <div className="all-grid">
            {allArtists.map((artist, index) => (
              <motion.article
                key={artist.id}
                className="all-card"
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px', amount: 0.3 }}
                transition={{
                  duration: 0.7,
                  ease: featuredEase,
                  delay: index * 0.1,
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.5, ease: featuredScaleEase },
                }}
              >
                <Link to={artist.link || '/explore'} className="all-card-link">
                  <motion.div
                    className="all-image-wrap"
                    whileHover={{ scale: 0.97 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img src={artist.coverImage} alt={artist.name} className="all-image" />
                  </motion.div>
                  <div className="all-meta">
                    <h4>{artist.name}</h4>
                    <p>{artist.discipline}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
