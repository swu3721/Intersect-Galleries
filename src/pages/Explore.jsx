import { useState, useMemo } from 'react';
import { users, categories } from '../data/mockData';
import UserCard from '../components/UserCard/UserCard';
import ArtworkCard from '../components/ArtworkCard/ArtworkCard';
import './Explore.css';

export default function Explore() {
  const [activeTab, setActiveTab] = useState('artists');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const allArtworks = useMemo(() => {
    return users.flatMap(user =>
      user.artworks.map(art => ({
        ...art,
        artistName: user.name,
        username: user.username,
        userId: user.id,
      }))
    );
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.tags.some(t => t.toLowerCase().includes(q));
      const matchesCategory = activeCategory === 'All' ||
        u.tags.some(t => t === activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const filteredArtworks = useMemo(() => {
    return allArtworks.filter(art => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        art.title.toLowerCase().includes(q) ||
        art.artistName.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' ||
        art.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allArtworks, searchQuery, activeCategory]);

  return (
    <div className="explore">
      <div className="explore-header">
        <div className="explore-header-inner">
          <h1 className="explore-title">Explore</h1>
          <p className="explore-subtitle">Discover artists and artworks from around the world</p>

          <div className="explore-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search artists, artworks, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      <div className="explore-body">
        <div className="explore-inner">
          {/* Tabs */}
          <div className="explore-tabs">
            <button
              className={`explore-tab${activeTab === 'artists' ? ' active' : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              Artists
              <span className="tab-count">{filteredUsers.length}</span>
            </button>
            <button
              className={`explore-tab${activeTab === 'artworks' ? ' active' : ''}`}
              onClick={() => setActiveTab('artworks')}
            >
              Artworks
              <span className="tab-count">{filteredArtworks.length}</span>
            </button>
          </div>

          {/* Category filters */}
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-pill${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results */}
          {activeTab === 'artists' && (
            filteredUsers.length > 0 ? (
              <div className="explore-grid explore-grid--users">
                {filteredUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">🎨</p>
                <p className="empty-text">No artists match your search.</p>
              </div>
            )
          )}

          {activeTab === 'artworks' && (
            filteredArtworks.length > 0 ? (
              <div className="explore-grid explore-grid--artworks">
                {filteredArtworks.map(art => (
                  <ArtworkCard
                    key={art.id}
                    artwork={art}
                    artistName={art.artistName}
                    username={art.username}
                    userId={art.userId}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-icon">🖼️</p>
                <p className="empty-text">No artworks match your search.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
