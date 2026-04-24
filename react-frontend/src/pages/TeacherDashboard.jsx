import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const TeacherDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getDashboardStats, getApplications, updateApplicationStatus } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalStudents: 0, totalApplications: 0 });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState({});

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login?role=teacher');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const dashStats = await getDashboardStats();
        setStats(dashStats);
        const apps = await getApplications();
        setApplications(apps);
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleUpdateAppStatus = async (appId) => {
    const newStatus = pendingStatusUpdates[appId];
    if (!newStatus) return;
    
    const { error } = await updateApplicationStatus(appId, newStatus);
    if (!error) {
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      
      const updatedPending = { ...pendingStatusUpdates };
      delete updatedPending[appId];
      setPendingStatusUpdates(updatedPending);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="login-spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Profile Not Found</h2>
        <p>Your user profile could not be loaded. Please ensure the database setup script has been run properly.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ background: 'linear-gradient(180deg, var(--info) 0%, var(--primary-dark) 100%)' }}>
        <ul className="admin-menu">
            <li><button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button></li>
            <li><button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>Students</button></li>
            <li><button className={activeTab === 'evaluations' ? 'active' : ''} onClick={() => setActiveTab('evaluations')}>Evaluations</button></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-header">
            <div>
                <h1 style={{ margin: '0 0 var(--spacing-xs) 0', background: 'linear-gradient(135deg, var(--info) 0%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Teacher Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome, {profile.name || 'Teacher User'} ({profile.department || 'Department'})</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--info), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontWeight: 'bold' }}>
                  TR
                </div>
            </div>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="admin-tab-content">
            {/* Statistics */}
            <div className="admin-stats-grid">


                <div class="admin-stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Total Students</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--success)' }}>{stats.totalStudents || 85}</div>
                </div>
                
                <div class="admin-stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Evaluations</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)' }}>5</div>
                </div>
            </div>

          </div>
        )}

        {/* EVALUATIONS TAB */}
        {activeTab === 'evaluations' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>My Mentee Updates & Evaluations</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Application Details</th>
                            <th>Status Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length > 0 ? applications.map(app => (
                            <tr key={app.id}>
                                <td>{app.student_name || 'Student'}</td>
                                <td>{app.student_email || 'No email'}</td>
                                <td>Applied to <strong>{app.company || app.jobs?.company}</strong> for {app.job_title || app.jobs?.title}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <select 
                                      value={pendingStatusUpdates[app.id] || app.status} 
                                      onChange={(e) => setPendingStatusUpdates({ ...pendingStatusUpdates, [app.id]: e.target.value })}
                                      style={{ 
                                        padding: '0.2rem 0.5rem', 
                                        borderRadius: '4px', 
                                        border: '1px solid var(--border-color)', 
                                        background: 'var(--bg-white)', 
                                        color: 'var(--text-primary)' 
                                      }}
                                    >
                                      <option value="applied">Applied</option>
                                      <option value="shortlisted">Shortlisted</option>
                                      <option value="interview">Interview</option>
                                      <option value="selected">Selected</option>
                                      <option value="rejected">Rejected</option>
                                    </select>
                                    
                                    {pendingStatusUpdates[app.id] && pendingStatusUpdates[app.id] !== app.status && (
                                      <button 
                                        onClick={() => handleUpdateAppStatus(app.id)}
                                        className="btn btn-primary btn-sm"
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                      >
                                        Apply
                                      </button>
                                    )}
                                  </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No applications found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* Mock Tabs */}
        {activeTab !== 'dashboard' && activeTab !== 'evaluations' && (
          <div className="admin-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module Under Construction</h3>
            <p>This module is currently being integrated with the new Supabase backend.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
