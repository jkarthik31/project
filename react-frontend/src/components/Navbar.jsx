import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isLoggedIn, currentUser, profile, signOut, loading, isPending, isRejected } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  // Pending/rejected users see minimal nav
  const showPendingNav = isLoggedIn && currentUser && (isPending || isRejected);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {location.pathname !== '/' && (
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem' }}>
              ← Back
            </button>
          )}
          <Link to={isLoggedIn && currentUser ? (showPendingNav ? '/pending' : getDashboardLink()) : "/"} className="navbar-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Campus Nexus" style={{ height: '32px', width: 'auto', borderRadius: '4px' }} onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }} />
            <div className="navbar-logo-fallback" style={{ display: 'none', width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontWeight: 'bold', fontSize: '12px' }}>
              CN
            </div>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600', color: 'var(--text-primary)' }}>Campus Nexus</span>
          </Link>
        </div>
        <div className="navbar-end" style={{ minWidth: 0 }}>
          <button
            type="button"
            className="theme-toggle"
            style={{ flexShrink: 0 }}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {showPendingNav ? (
            /* Minimal nav for pending/rejected users */
            <div className="navbar-pending-actions">
              <span style={{
                background: isPending ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                color: isPending ? 'var(--warning)' : 'var(--danger)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isPending ? 'var(--warning)' : 'var(--danger)',
                  display: 'inline-block',
                }} />
                {isPending ? 'Pending Approval' : 'Rejected'}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ cursor: 'pointer', padding: '0.4rem 1rem' }}>
                Logout
              </button>
            </div>
          ) : isLoggedIn && currentUser ? (
            <div className="navbar-links">
              <Link to={getDashboardLink()} className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
              {profile?.role === 'student' && (
                <>
                  <Link to="/jobs" className="btn btn-ghost btn-sm">
                    Jobs
                  </Link>
                  <Link to="/applications" className="btn btn-ghost btn-sm">
                    Applications
                  </Link>
                </>
              )}
              <Link to="/profile" className="navbar-user-link">
                <div className="avatar-chip">
                  {currentUser.name?.charAt(0) || 'U'}
                </div>
                <span>{currentUser.name || currentUser.email}</span>
              </Link>
              <NotificationBell />
              <button
                onClick={handleLogout}
                disabled={loading}
                className="btn btn-outline"
                style={{ cursor: 'pointer', padding: '0.4rem 1rem' }}>
                {loading ? '...' : 'Logout'}
              </button>
            </div>
          ) : (
            <div className="navbar-auth-links">
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
