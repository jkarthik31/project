import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getApplications } = useData();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const apps = await getApplications(user.id);
        setApplications(apps);
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(79,70,229,0.2)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (!profile) return null;

  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;

  return (
    <div style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Student Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Welcome back, {profile.name || profile.email}</p>

      {/* Stats Cards */}
      <div className="glass-cards-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <span className="card-icon">💼</span>
          <div className="card-value">{applications.length}</div>
          <div className="card-label">Total Applications</div>
        </div>
        <div className="glass-card">
          <span className="card-icon">📋</span>
          <div className="card-value">{appliedCount}</div>
          <div className="card-label">Applied</div>
        </div>
        <div className="glass-card">
          <span className="card-icon">⭐</span>
          <div className="card-value">{shortlistedCount}</div>
          <div className="card-label">Shortlisted</div>
        </div>
        <div className="glass-card">
          <span className="card-icon">✅</span>
          <div className="card-value">{selectedCount}</div>
          <div className="card-label">Selected</div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Recent Applications</h3>
        {applications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No applications yet. Start applying to jobs!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Company</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Position</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{app.jobs?.company || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>{app.jobs?.position || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: app.status === 'selected' ? 'rgba(16,185,129,0.15)' :
                                    app.status === 'shortlisted' ? 'rgba(245,158,11,0.15)' :
                                    app.status === 'rejected' ? 'rgba(239,68,68,0.15)' :
                                    'rgba(59,130,246,0.15)',
                        color: app.status === 'selected' ? '#059669' :
                               app.status === 'shortlisted' ? '#d97706' :
                               app.status === 'rejected' ? '#dc2626' :
                               '#2563eb',
                      }}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
