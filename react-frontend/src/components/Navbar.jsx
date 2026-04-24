import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, currentUser, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <nav className="navbar">
      <div className="navbar-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {location.pathname !== '/' && (
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem' }}>
              ← Back
            </button>
          )}
          <Link to={isLoggedIn && currentUser ? getDashboardLink() : "/"} className="navbar-brand" style={{ textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--primary)"/>
              <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fontSize="12" fontWeight="bold" fill="var(--bg-white)">CN</text>
            </svg>
            <span>Campus Nexus</span>
          </Link>
        </div>
        <div className="navbar-end">
          {isLoggedIn && currentUser ? (
            <>
              <Link to={getDashboardLink()} style={{ color: 'var(--text-primary)', marginRight: '1.5rem', fontWeight: 600, textDecoration: 'none' }}>
                Dashboard
              </Link>
              {profile?.role === 'student' && (
                <>
                  <Link to="/jobs" style={{ color: 'var(--text-primary)', marginRight: '1.5rem', fontWeight: 600, textDecoration: 'none' }}>
                    Jobs
                  </Link>
                  <Link to="/applications" style={{ color: 'var(--text-primary)', marginRight: '1.5rem', fontWeight: 600, textDecoration: 'none' }}>
                    Applications
                  </Link>
                </>
              )}
              <Link to="/profile" style={{ color: 'var(--text-primary)', marginRight: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--bg-white)' }}>
                  {currentUser.name?.charAt(0) || 'U'}
                </div>
                <span>{currentUser.name || currentUser.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="btn btn-outline"
                style={{ cursor: 'pointer', padding: '0.4rem 1rem' }}>
                {loading ? '...' : 'Logout'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/?role=student" className="btn btn-outline btn-sm">Student</Link>
              <Link to="/?role=teacher" className="btn btn-ghost btn-sm">Teacher</Link>
              <Link to="/?role=hod" className="btn btn-ghost btn-sm">HOD</Link>
              <Link to="/?role=admin" className="btn btn-secondary btn-sm">Admin</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
