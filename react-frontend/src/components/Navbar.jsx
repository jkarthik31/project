import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, currentUser, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!profile) return '/dashboard';
    switch (profile.role) {
      case 'admin': return '/admin';
      case 'hod': return '/hod';
      case 'teacher': return '/teacher';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="navbar navbar-landing">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="white"/>
            <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fontSize="12" fontWeight="bold" fill="#1E3A8A">CN</text>
          </svg>
          <span>Campus Nexus</span>
        </Link>
        <div className="navbar-end">
          {isLoggedIn && currentUser ? (
            <>
              <Link
                to={getDashboardLink()}
                style={{ color: 'white', marginRight: '1rem', fontWeight: 600, textDecoration: 'none' }}
              >
                📊 Dashboard
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.85)', marginRight: '1rem', fontSize: '0.9rem' }}>
                Hi, {currentUser.name || currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="btn btn-outline"
                style={{ borderColor: 'white', color: 'white', background: 'transparent', cursor: 'pointer' }}>
                {loading ? '...' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Student Login</Link>
              <Link to="/login?role=admin" className="btn btn-secondary">Admin Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
