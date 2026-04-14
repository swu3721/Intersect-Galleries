import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home currentUser={currentUser} />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:username" element={<Profile currentUser={currentUser} />} />
            <Route path="/login" element={
              currentUser ? <Navigate to={`/profile/${currentUser.username}`} replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/signup" element={
              currentUser ? <Navigate to={`/profile/${currentUser.username}`} replace /> : <Signup onLogin={handleLogin} />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
