import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const TeacherDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getDashboardStats, getApplications, updateApplicationStatus, getProfilesByDepartment } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [, setStats] = useState({ totalStudents: 0, totalApplications: 0 });
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
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
        
        // Get students from own department only
        const studentData = profile?.department
          ? await getProfilesByDepartment(profile.department)
          : [];
        setStudents(studentData.filter(p => p.role === 'student'));
        
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
      <aside className="admin-sidebar" style={{ background: 'var(--primary)' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <h1 style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--primary)' }}>
                    Teacher Dashboard
                  </h1>
                  {profile.department && (
                    <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{profile.department}</span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome, {profile.name || 'Teacher User'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontWeight: 'bold' }}>
                  TR
                </div>
            </div>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="admin-tab-content">
            {/* Statistics */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Total Students</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary)' }}>{students.length}</div>
                </div>
                
                <div className="admin-stat-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Evaluations</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary)' }}>{applications.filter(a => a.status === 'applied').length}</div>
                </div>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>My Department Students ({profile.department})</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Company Applied</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? students.map(student => {
                            const studentApps = applications.filter(a => a.student_id === student.id || a.student_email === student.email);
                            return (
                            <tr key={student.id}>
                                <td>{student.name || 'Unnamed Student'}</td>
                                <td>
                                  {studentApps.length > 0 
                                    ? studentApps.map((a, i) => <div key={i}>{a.company || a.jobs?.company || 'Unknown Company'}</div>) 
                                    : <span style={{ color: 'var(--text-muted)' }}>Not applied</span>}
                                </td>
                                <td>
                                  {studentApps.length > 0 
                                    ? studentApps.map((a, i) => (
                                        <div key={i} style={{ marginBottom: '4px' }}>
                                          <span className={`badge badge-${a.status === 'applied' ? 'info' : a.status === 'selected' ? 'success' : a.status === 'rejected' ? 'danger' : 'warning'}`}>
                                            {a.status.toUpperCase()}
                                          </span>
                                        </div>
                                      ))
                                    : '-'}
                                </td>
                                <td>
                                  <button className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: 'var(--info)' }}>View Profile</button>
                                </td>
                            </tr>
                            );
                        }) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>No students found.</td></tr>
                        )}
                    </tbody>
                </table>
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
                                      <option value="offer">Offer</option>
                                      <option value="rejected">Rejected</option>
                                    </select>
                                    
                                    {pendingStatusUpdates[app.id] && pendingStatusUpdates[app.id] !== app.status && (
                                      <button 
                                        onClick={() => handleUpdateAppStatus(app.id)}
                                        className="btn btn-accent btn-sm"
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                      >
                                        Apply
                                      </button>
                                    )}
                                  </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>No applications found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default TeacherDashboard;
