import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const HODDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getDashboardStats, getApplications, getJobs, createJob, deleteJob, updateApplicationStatus } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalStudents: 0, totalApplications: 0, totalJobs: 0 });
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState({});

  // New Job Form State
  const [newJob, setNewJob] = useState({ title: '', company: '', position: '', location: '', deadline: '', status: 'active' });
  const [jobCreating, setJobCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login?role=hod');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const [dashStats, apps, jobsData] = await Promise.all([
          getDashboardStats(),
          getApplications(),
          getJobs()
        ]);
        setStats(dashStats || { totalStudents: 0, totalApplications: 0, totalJobs: 0 });
        setApplications(apps || []);
        setJobs(jobsData || []);
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setJobCreating(true);
    const { data, error } = await createJob(newJob);
    if (!error && data) {
      setJobs([data, ...jobs]);
      setNewJob({ title: '', company: '', position: '', location: '', deadline: '', status: 'active' });
    }
    setJobCreating(false);
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      const { error } = await deleteJob(id);
      if (!error) {
        setJobs(jobs.filter(j => j.id !== id));
      }
    }
  };

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
      <aside className="admin-sidebar" style={{ background: 'linear-gradient(180deg, var(--secondary) 0%, var(--primary-dark) 100%)' }}>
        <ul className="admin-menu">
            <li><button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button></li>
            <li><button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>My Students</button></li>
            <li><button className={activeTab === 'jobs' ? 'active' : ''} onClick={() => setActiveTab('jobs')}>Jobs</button></li>
            <li><button className={activeTab === 'approvals' ? 'active' : ''} onClick={() => setActiveTab('approvals')}>Approvals</button></li>
            <li><button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>Dept Reports</button></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-header">
            <div>
                <h1 style={{ margin: '0 0 var(--spacing-xs) 0', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  HOD Dashboard - {profile.department || 'Department'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome back, {profile.name || 'HOD User'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--warning), var(--danger))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontWeight: 'bold' }}>
                  HO
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
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary)' }}>{stats.totalStudents || 120}</div>
                </div>

                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Total Applications</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--success)' }}>{stats.totalApplications || 450}</div>
                </div>

                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Approvals</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)' }}>12</div>
                </div>
                
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--info)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Active Jobs</div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--info)' }}>{stats.totalJobs || jobs.length || 0}</div>
                </div>
            </div>

          </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Student Applications & Approvals</h3>
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

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div className="admin-section">
            <h3 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>Manage Jobs</h3>
            
            <div style={{ background: 'var(--bg-gray)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--spacing-xl)' }}>
              <h4>Post New Job</h4>
              <form onSubmit={handleCreateJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <input type="text" placeholder="Job Title" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                <input type="text" placeholder="Company Name" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                <input type="text" placeholder="Position / Role" required value={newJob.position} onChange={e => setNewJob({...newJob, position: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                <input type="text" placeholder="Location" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                <input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                <button type="submit" disabled={jobCreating} className="btn btn-primary" style={{ height: 'fit-content', alignSelf: 'center' }}>
                  {jobCreating ? 'Posting...' : 'Post Job'}
                </button>
              </form>
            </div>

            <h4>Existing Jobs</h4>
            {jobs.length === 0 ? <p>No jobs found.</p> : (
              <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                      <thead>
                          <tr>
                              <th>Company</th>
                              <th>Title</th>
                              <th>Deadline</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {jobs.map(job => (
                              <tr key={job.id}>
                                  <td>{job.company}</td>
                                  <td>{job.title}</td>
                                  <td>{new Date(job.deadline).toLocaleDateString()}</td>
                                  <td>
                                    <button onClick={() => handleDeleteJob(job.id)} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            )}
          </div>
        )}

        {/* Mock Tabs */}
        {activeTab !== 'dashboard' && activeTab !== 'jobs' && activeTab !== 'approvals' && (
          <div className="admin-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module Under Construction</h3>
            <p>This module is currently being integrated with the new Supabase backend.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HODDashboard;
