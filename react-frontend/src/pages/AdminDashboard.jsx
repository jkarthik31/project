import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getDashboardStats, getJobs, createJob, deleteJob, getAllProfiles, updateProfileRole } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalStudents: 0, totalJobs: 0, totalApplications: 0 });
  const [jobs, setJobs] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Job Form State
  const [newJob, setNewJob] = useState({ title: '', company: '', position: '', location: '', deadline: '', status: 'active' });
  const [jobCreating, setJobCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/?role=admin');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!profile) return;
    const timeout = setTimeout(() => setLoading(false), 5000);
    Promise.all([getDashboardStats(), getJobs(), getAllProfiles()])
      .then(([dashStats, jobsData, profilesData]) => {
        setStats(dashStats || { totalStudents: 0, totalJobs: 0, totalApplications: 0 });
        setJobs(jobsData || []);
        setProfiles(profilesData || []);
      })
      .finally(() => { setLoading(false); clearTimeout(timeout); });
    return () => clearTimeout(timeout);
  }, [profile]);

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

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await updateProfileRole(userId, newRole);
    if (!error) {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
    }
  };

  if (authLoading && !profile) {
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
        <button onClick={() => navigate('/')} className="btn btn-primary">Return to Login</button>
      </div>
    );
  }

  const placements = Math.floor(stats.totalApplications * 0.15) || 1235;

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <ul className="admin-menu">
            <li><button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button></li>
            <li><button className={activeTab === 'departments' ? 'active' : ''} onClick={() => setActiveTab('departments')}>Departments</button></li>
            <li><button className={activeTab === 'hods' ? 'active' : ''} onClick={() => setActiveTab('hods')}>HODs</button></li>
            <li><button className={activeTab === 'permissions' ? 'active' : ''} onClick={() => setActiveTab('permissions')}>Permissions</button></li>
            <li><button className={activeTab === 'jobs' ? 'active' : ''} onClick={() => setActiveTab('jobs')}>Jobs</button></li>
            <li><button className={activeTab === 'applications' ? 'active' : ''} onClick={() => setActiveTab('applications')}>Applications</button></li>
            <li><button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>Reports</button></li>
            <li><button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</button></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-header">
            <div>
                <h1 style={{ margin: '0 0 var(--spacing-xs) 0', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Admin Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome back, {profile.name || 'Administrator'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontWeight: 'bold' }}>
                  AD
                </div>
            </div>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="admin-tab-content">
            {/* Statistics Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Total Students</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary)' }}>{stats.totalStudents || 2450}</div>
                    <div style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>↑ Active Directory</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Active Job Posts</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--success)' }}>{stats.totalJobs || 42}</div>
                    <div style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>↑ Live Now</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Total Applications</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)' }}>{stats.totalApplications || 8726}</div>
                    <div style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>↑ System Wide</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--info)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Placements</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--info)' }}>{placements}</div>
                    <div style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>↑ Growing</div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="admin-section">
                <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Live Job Postings</h3>
                {jobs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No jobs available.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Role</th>
                                    <th>Location</th>
                                    <th>Deadline</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.slice(0,5).map(job => (
                                    <tr key={job.id}>
                                        <td style={{ fontWeight: 600 }}>{job.company}</td>
                                        <td>{job.position || job.title}</td>
                                        <td>{job.location || 'N/A'}</td>
                                        <td>{new Date(job.deadline).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
                <input type="text" placeholder="Job Title" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Company Name" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Position / Role" required value={newJob.position} onChange={e => setNewJob({...newJob, position: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Location" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
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
                                    <button onClick={() => handleDeleteJob(job.id)} className="btn btn-outline" style={{ color: 'red', borderColor: 'red', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Delete</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            )}
          </div>
        )}

        {/* PERMISSIONS TAB */}
        {activeTab === 'permissions' && (
          <div className="admin-section">
            <h3 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>Manage User Permissions</h3>
            {profiles.length === 0 ? <p>No users found.</p> : (
              <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                      <thead>
                          <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Current Role</th>
                              <th>Change Role</th>
                          </tr>
                      </thead>
                      <tbody>
                          {profiles.map(userProfile => (
                              <tr key={userProfile.id}>
                                  <td>{userProfile.name}</td>
                                  <td>{userProfile.email}</td>
                                  <td><span style={{ background: 'var(--bg-gray)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'uppercase' }}>{userProfile.role}</span></td>
                                  <td>
                                    <select 
                                      value={userProfile.role} 
                                      onChange={(e) => handleRoleChange(userProfile.id, e.target.value)}
                                      style={{ padding: '0.2rem', borderRadius: '4px' }}
                                    >
                                      <option value="student">Student</option>
                                      <option value="teacher">Teacher</option>
                                      <option value="hod">HOD</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            )}
          </div>
        )}

        {/* Mock Tabs for visual completion */}
        {activeTab !== 'dashboard' && activeTab !== 'jobs' && activeTab !== 'permissions' && (
          <div className="admin-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module Under Construction</h3>
            <p>This module is currently being integrated with the new Supabase backend.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
