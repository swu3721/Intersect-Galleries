import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>intersect_galleries</h3>
            <p className="footer-tagline">
              Platform for contemporary artists to showcase their vision and connect with the world
            </p>
          </div>

          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Contact</a>
            <Link to="/signup">Submit</Link>
            <a href="#">Instagram</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 intersect_galleries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
