import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.username.trim()) newErrors.username = 'Username is required.';
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username.toLowerCase()))
      newErrors.username = 'Username: 3-20 chars, letters, numbers, underscores.';
    if (!form.email.includes('@')) newErrors.email = 'Enter a valid email.';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Create a new user object (demo)
    const newUser = {
      id: Date.now(),
      username: form.username.toLowerCase(),
      name: form.name,
      bio: 'Creative professional sharing my work on Intersect.',
      avatar: null,
      avatarColor: '#7C3AED',
      initials: form.name.slice(0, 2).toUpperCase(),
      coverColor: '#4C1D95',
      location: '',
      website: '',
      followers: 0,
      following: 0,
      artworks: [],
      tags: [],
    };
    onLogin(newUser);
    navigate(`/profile/${newUser.username}`);
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">✦</span>
          <span>Intersect</span>
        </div>
        <h1 className="auth-title">Create your portfolio</h1>
        <p className="auth-subtitle">Share your work with the world — free forever</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="signup-username">Username</label>
            <div className="username-input-wrap">
              <span className="username-prefix">@</span>
              <input
                id="signup-username"
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={handleChange('username')}
                required
                autoComplete="username"
                className="has-prefix"
              />
            </div>
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              required
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange('password')}
              required
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <button type="submit" className="auth-submit">Create account</button>
        </form>

        <p className="auth-terms">
          By signing up, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
