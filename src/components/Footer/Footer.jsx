import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <motion.div
          className="footer-grid"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p>© 2026 intersect_galleries. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}
