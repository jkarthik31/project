import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getDashboardStats, getJobs, getProfilesByRole } = useData();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, totalJobs: 0, totalApplications: 0 });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login?role=admin');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const [dashStats, jobsData] = await Promise.all([
          getDashboardStats(),
          getJobs(),
        ]);
        setStats(dashStats);
        setJobs(jobsData);
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

  return (
    <div style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Admin Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage the placement portal</p>

      {/* Stats */}
      <div className="glass-cards-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <span className="card-icon">👥</span>
          <div className="card-value">{stats.totalStudents}</div>
          <div className="card-label">Total Students</div>
        </div>
        <div className="glass-card">
          <span className="card-icon">💼</span>
          <div className="card-value">{stats.totalJobs}</div>
          <div className="card-label">Active Jobs</div>
        </div>
        <div className="glass-card">
          <span className="card-icon">📋</span>
          <div className="card-value">{stats.totalApplications}</div>
          <div className="card-label">Total Applications</div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Active Job Postings</h3>
        {jobs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No active jobs. Create one to get started!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Title</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Company</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Position</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{job.title}</td>
                    <td style={{ padding: '0.75rem' }}>{job.company}</td>
                    <td style={{ padding: '0.75rem' }}>{job.position}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
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

export default AdminDashboard;
