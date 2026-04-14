import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { users } from '../data/mockData';
import './Auth.css';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.username === form.username.toLowerCase().trim());
    if (!user) {
      setError('No account found with that username.');
      return;
    }
    // Demo: any password works
    onLogin(user);
    navigate(`/profile/${user.username}`);
  };

  // Quick demo login
  const demoLogin = (user) => {
    onLogin(user);
    navigate(`/profile/${user.username}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">✦</span>
          <span>Intersect</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to your portfolio</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="your_username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
            <span className="field-hint">Any password works in this demo.</span>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="auth-submit">Log in</button>
        </form>

        <div className="auth-divider"><span>or try a demo account</span></div>

        <div className="demo-accounts">
          {users.slice(0, 3).map(user => (
            <button key={user.id} className="demo-account" onClick={() => demoLogin(user)}>
              <span className="demo-avatar" style={{ background: user.avatarColor }}>
                {user.initials}
              </span>
              <span className="demo-info">
                <span className="demo-name">{user.name}</span>
                <span className="demo-username">@{user.username}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
