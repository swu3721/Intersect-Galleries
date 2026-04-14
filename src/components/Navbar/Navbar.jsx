import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar({ currentUser, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-text">Intersect</span>
        </Link>

        <div className="navbar-links">
          <Link to="/explore" className="nav-link">Explore</Link>
          {currentUser ? (
            <>
              <Link to={`/profile/${currentUser.username}`} className="nav-link">My Portfolio</Link>
              <button className="nav-btn-outline" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/signup" className="nav-btn">Join free</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/explore" className="mobile-link" onClick={() => setMenuOpen(false)}>Explore</Link>
          {currentUser ? (
            <>
              <Link to={`/profile/${currentUser.username}`} className="mobile-link" onClick={() => setMenuOpen(false)}>My Portfolio</Link>
              <button className="mobile-link mobile-logout" onClick={() => { onLogout(); setMenuOpen(false); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/signup" className="mobile-link" onClick={() => setMenuOpen(false)}>Join free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
