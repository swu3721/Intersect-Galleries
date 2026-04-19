import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import { useAuth } from './context/AuthContext';
import './App.css';

export default function App() {
  const { session, profile, ready, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    const allowed =
      location.pathname === '/' ||
      location.pathname === '/explore' ||
      location.pathname === '/onboarding' ||
      location.pathname === '/login' ||
      location.pathname === '/signup';
    if (session && profile && !profile.onboarding_complete && !allowed) {
      navigate('/onboarding', { replace: true });
    }
  }, [ready, session, profile, location.pathname, navigate]);

  if (!ready) {
    return (
      <div className="app-shell">
        <main className="app-main app-loading" role="status">
          Loading…
        </main>
      </div>
    );
  }

  const postAuthPath =
    profile && !profile.onboarding_complete
      ? '/onboarding'
      : profile
        ? `/profile/${profile.username}`
        : '/';

  return (
    <div className="app-shell">
      <Navbar onLogout={signOut} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route
            path="/login"
            element={
              session ? <Navigate to={postAuthPath} replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              session ? <Navigate to={postAuthPath} replace /> : <Signup />
            }
          />
          <Route
            path="/onboarding"
            element={
              !session ? <Navigate to="/login" replace /> : <Onboarding />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
