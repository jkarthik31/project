import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
  const { profile, isLoggedIn, isPending, isRejected, isApproved, signOut, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [polling, setPolling] = useState(false);
  const [dots, setDots] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) navigate('/');
  }, [loading, isLoggedIn, navigate]);

  // Redirect if already approved
  useEffect(() => {
    if (isApproved && profile) {
      switch (profile.role) {
        case 'admin': navigate('/admin'); break;
        case 'hod': navigate('/hod'); break;
        case 'teacher': navigate('/teacher'); break;
        default: navigate('/dashboard');
      }
    }
  }, [isApproved, profile, navigate]);

  // Poll for approval status every 30 seconds
  useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(async () => {
      setPolling(true);
      await refreshProfile();
      setPolling(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [isPending, refreshProfile]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const handleRefresh = async () => {
    setPolling(true);
    await refreshProfile();
    setPolling(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 70px)',
      padding: 'var(--spacing-xl)',
      background: 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-gray) 100%)',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        background: 'var(--bg-white)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--spacing-2xl) var(--spacing-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative top bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: isRejected
            ? 'linear-gradient(90deg, var(--danger), #ef4444)'
            : 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
        }} />

        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isRejected
            ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))'
            : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.05))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--spacing-lg)',
          fontSize: '36px',
          animation: isRejected ? 'none' : 'pulse-glow 2s ease-in-out infinite',
        }}>
          {isRejected ? '❌' : '⏳'}
        </div>

        <style>{`
          @keyframes pulse-glow {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.85; }
          }
        `}</style>

        {/* Title */}
        <h2 style={{
          margin: '0 0 var(--spacing-sm)',
          color: isRejected ? 'var(--danger)' : 'var(--primary)',
          fontSize: 'var(--font-size-xl)',
          fontWeight: 700,
        }}>
          {isRejected ? 'Account Not Approved' : `Awaiting Approval${dots}`}
        </h2>

        {/* Subtitle */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-sm)',
          margin: '0 0 var(--spacing-lg)',
          lineHeight: 1.6,
        }}>
          {isRejected ? (
            <>
              Your account registration was not approved.
              {profile?.rejection_reason && (
                <span style={{
                  display: 'block',
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  background: 'rgba(239,68,68,0.05)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  color: 'var(--danger)',
                  fontWeight: 500,
                }}>
                  Reason: {profile.rejection_reason}
                </span>
              )}
            </>
          ) : (
            <>
              Your account has been created and is pending approval from
              {profile?.role === 'hod' ? ' an Administrator' : ' your HOD or an Administrator'}.
              <br /><br />
              You'll receive a notification once your account is approved.
              This page checks automatically every 30 seconds.
            </>
          )}
        </p>

        {/* User info card */}
        <div style={{
          background: 'var(--bg-light)',
          borderRadius: 'var(--border-radius)',
          padding: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Name</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{profile?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{profile?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Role</span>
            <span style={{
              background: 'var(--primary)',
              color: 'var(--bg-white)',
              padding: '1px 8px',
              borderRadius: '4px',
              fontSize: 'var(--font-size-xs)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>{profile?.role}</span>
          </div>
          {profile?.department && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Department</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{profile.department}</span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {isPending && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--warning)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--warning)',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }} />
            {polling ? 'Checking status...' : 'Status: Pending Approval'}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isPending && (
            <button
              onClick={handleRefresh}
              disabled={polling}
              className="btn btn-primary"
              style={{ minWidth: '140px' }}
            >
              {polling ? 'Checking...' : '🔄 Check Status'}
            </button>
          )}
          <button onClick={handleLogout} className="btn btn-outline" style={{ minWidth: '120px' }}>
            Logout
          </button>
        </div>

        {/* Contact info */}
        <p style={{
          marginTop: 'var(--spacing-lg)',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-xs)',
        }}>
          Need help? Contact your administrator at <strong>admin@placementportal.edu</strong>
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;
