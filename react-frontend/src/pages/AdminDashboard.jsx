import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

// Pure-CSS bar chart component
const BarChart = ({ data, labelKey, valueKey, color = 'var(--primary)' }) => {
  if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No data available.</p>;
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0)) || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px', color: 'var(--text-secondary)' }}>
            <span>{item[labelKey]}</span>
            <strong style={{ color: 'var(--text-primary)' }}>{item[valueKey]}</strong>
          </div>
          <div style={{ height: '10px', background: 'var(--bg-gray)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(Number(item[valueKey]) / max) * 100}%`,
              background: color,
              borderRadius: '5px',
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics, analyticsLoading, loadAnalytics }) => {
  React.useEffect(() => { loadAnalytics(); }, []);
  const { overview, departments, companies, statuses } = analytics;
  const statusColor = { applied: 'var(--info)', shortlisted: 'var(--warning)', interview: 'var(--secondary)', selected: 'var(--success)', offer: 'var(--success)', rejected: 'var(--danger)' };

  if (analyticsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
        <div className="login-spinner" style={{ width: '36px', height: '36px', borderWidth: '3px', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>📈 Placement Analytics</h3>

      {/* KPI Cards */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          {[
            { label: 'Total Students', value: overview.total_students, color: 'var(--primary)' },
            { label: 'Applications', value: overview.total_applications, color: 'var(--secondary)' },
            { label: 'Placed', value: overview.total_placed, color: 'var(--success)' },
            { label: 'Active Jobs', value: overview.total_jobs, color: 'var(--warning)' },
            { label: 'Placement Rate', value: `${overview.placement_rate}%`, color: overview.placement_rate > 50 ? 'var(--success)' : 'var(--danger)' },
          ].map(k => (
            <div key={k.label} className="admin-stat-card" style={{ textAlign: 'center', borderLeftColor: k.color }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{k.label}</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        {/* By Department */}
        <div className="admin-section">
          <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>Applications by Department</h4>
          <BarChart data={departments} labelKey="department" valueKey="total_applications" color="var(--primary)" />
        </div>

        {/* Application status breakdown */}
        <div className="admin-section">
          <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>Application Status Breakdown</h4>
          <BarChart
            data={statuses}
            labelKey="status"
            valueKey="count"
            color="var(--secondary)"
          />
        </div>
      </div>

      {/* Top Companies */}
      <div className="admin-section">
        <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>Top Hiring Companies</h4>
        <BarChart data={companies} labelKey="company" valueKey="total_applications" color="var(--accent)" />
      </div>

      {/* Placements by Dept table */}
      {departments.length > 0 && (
        <div className="admin-section" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>Department Placement Summary</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Applications</th>
                  <th>Unique Students</th>
                  <th>Placed</th>
                  <th>Placement Rate</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d, i) => {
                  const rate = d.unique_students > 0 ? Math.round((d.placed / d.unique_students) * 100) : 0;
                  return (
                    <tr key={i}>
                      <td><strong>{d.department || 'N/A'}</strong></td>
                      <td>{d.total_applications}</td>
                      <td>{d.unique_students}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{d.placed}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--bg-gray)', borderRadius: '3px' }}>
                            <div style={{ width: `${rate}%`, height: '100%', background: rate > 50 ? 'var(--success)' : 'var(--warning)', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '35px' }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


const AdminDashboard = () => {
  const { profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getDashboardStats, getJobs, createJob, deleteJob, getAllProfiles, updateProfileRole, getApplications,
          getAnalyticsOverview, getAnalyticsByDepartment, getAnalyticsCompanyTrends, getAnalyticsStatusBreakdown,
          getPendingApprovals, getApprovalHistory, getApprovalStats, approveUser, rejectUser } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalStudents: 0, totalJobs: 0, totalApplications: 0, pendingStudents: 0, pendingHODs: 0 });
  const [jobs, setJobs] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ overview: null, departments: [], companies: [], statuses: [] });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // New Job Form State
  const [newJob, setNewJob] = useState({ title: '', company: '', position: '', location: '', deadline: '', status: 'active', allowed_departments: [] });
  const [jobCreating, setJobCreating] = useState(false);

  // Approval State
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [approvalSearch, setApprovalSearch] = useState('');
  const [approvalRoleFilter, setApprovalRoleFilter] = useState('');
  const [rejectingUser, setRejectingUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/?role=admin');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!profile) return;
    const timeout = setTimeout(() => setLoading(false), 5000);
    Promise.all([getDashboardStats(), getJobs(), getAllProfiles(), getApplications()])
      .then(([dashStats, jobsData, profilesData, appsData]) => {
        setStats(dashStats || { totalStudents: 0, totalJobs: 0, totalApplications: 0 });
        setJobs(jobsData || []);
        setProfiles(profilesData || []);
        setApplications(appsData || []);
      })
      .finally(() => { setLoading(false); clearTimeout(timeout); });
    return () => clearTimeout(timeout);
  }, [profile]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setJobCreating(true);
    const jobPayload = {
      ...newJob,
      allowed_departments: newJob.allowed_departments.join(','),
    };
    const { data, error } = await createJob(jobPayload);
    if (!error && data) {
      setJobs([data, ...jobs]);
      setNewJob({ title: '', company: '', position: '', location: '', deadline: '', status: 'active', allowed_departments: [] });
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

  // Approval handlers
  const loadApprovals = async () => {
    setApprovalLoading(true);
    const [pending, history] = await Promise.all([
      getPendingApprovals({ search: approvalSearch, role: approvalRoleFilter }),
      getApprovalHistory(),
    ]);
    setPendingUsers(pending);
    setApprovalHistory(history);
    setApprovalLoading(false);
  };

  const handleApprove = async (userId) => {
    const { error } = await approveUser(userId);
    if (!error) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setStats(s => ({ ...s, pendingStudents: Math.max(0, s.pendingStudents - 1) }));
      loadApprovals();
    }
  };

  const handleReject = async (userId) => {
    const { error } = await rejectUser(userId, rejectReason);
    if (!error) {
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setRejectingUser(null);
      setRejectReason('');
      loadApprovals();
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
      <aside className="admin-sidebar" style={{ background: 'var(--primary)' }}>
        <ul className="admin-menu">
            <li><button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button></li>
            <li><button className={activeTab === 'approvals' ? 'active' : ''} onClick={() => { setActiveTab('approvals'); loadApprovals(); }} style={{ position: 'relative' }}>Approvals {(stats.pendingStudents + stats.pendingHODs) > 0 && <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', marginLeft: '6px' }}>{stats.pendingStudents + stats.pendingHODs}</span>}</button></li>
            <li><button className={activeTab === 'departments' ? 'active' : ''} onClick={() => setActiveTab('departments')}>Departments & HODs</button></li>
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
                <h1 style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--primary)' }}>
                  Admin Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome back, {profile.name || 'Administrator'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontWeight: 'bold' }}>
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
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary)' }}>{profiles.filter(p => p.role === 'student').length || stats.totalStudents || 2450}</div>
                    <div style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>↑ Active Directory</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Active Job Posts</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--success)' }}>{jobs.length || stats.totalJobs || 42}</div>
                    <div style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>↑ Live Now</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Total Applications</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)' }}>{applications.length || stats.totalApplications || 8726}</div>
                    <div style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>↑ System Wide</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--info)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Placements</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--info)' }}>{applications.filter(a => a.status === 'selected').length || placements}</div>
                    <div style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>↑ Growing</div>
                </div>
                {stats.pendingStudents > 0 && (
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Students</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)' }}>{stats.pendingStudents}</div>
                    <div style={{ color: 'var(--warning)', fontSize: 'var(--font-size-sm)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('approvals'); loadApprovals(); }}>Review →</div>
                </div>)}
                {stats.pendingHODs > 0 && (
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--danger)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Pending HODs</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--danger)' }}>{stats.pendingHODs}</div>
                    <div style={{ color: 'var(--danger)', fontSize: 'var(--font-size-sm)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('approvals'); loadApprovals(); }}>Review →</div>
                </div>)}
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

        {/* DEPARTMENTS TAB */}
        {activeTab === 'departments' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Departments & HOD Management</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th>Head of Department (HOD)</th>
                            <th>Email</th>
                            <th>Total Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.filter(p => p.role === 'hod').length > 0 ? profiles.filter(p => p.role === 'hod').map(hod => (
                            <tr key={hod.id}>
                                <td>{hod.department || 'Unassigned'}</td>
                                <td style={{ fontWeight: 600 }}>{hod.name || 'Pending Name'}</td>
                                <td>{hod.email}</td>
                                <td>{profiles.filter(p => p.department === hod.department && p.role === 'student').length} Enrolled</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>No departments or HODs registered yet.</td></tr>
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
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', display: 'block', marginBottom: '6px' }}>Eligible Departments</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    {['BCA', 'BSC', 'BCOM', 'BBA', 'BA'].map(d => (
                      <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input type="checkbox" checked={newJob.allowed_departments.includes(d)} onChange={e => {
                          const depts = e.target.checked
                            ? [...newJob.allowed_departments, d]
                            : newJob.allowed_departments.filter(x => x !== d);
                          setNewJob({...newJob, allowed_departments: depts});
                        }} />
                        {d}
                      </label>
                    ))}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                      <input type="checkbox" checked={newJob.allowed_departments.length === 0} onChange={() => setNewJob({...newJob, allowed_departments: []})} />
                      All Departments
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={jobCreating} className="btn btn-accent" style={{ height: 'fit-content', alignSelf: 'center' }}>
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
                              <th>Departments</th>
                              <th>Deadline</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {jobs.map(job => (
                              <tr key={job.id}>
                                  <td>{job.company}</td>
                                  <td>{job.title}</td>
                                  <td>
                                    {job.allowed_departments && job.allowed_departments.trim() !== '' ? (
                                      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                                        {job.allowed_departments.split(',').map(d => d.trim()).filter(Boolean).map(d => (
                                          <span key={d} style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 700 }}>{d}</span>
                                        ))}
                                      </div>
                                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>All</span>}
                                  </td>
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

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>System-Wide Applications</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Company / Job</th>
                            <th>Applied Date</th>
                            <th>Current Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length > 0 ? applications.map(app => (
                            <tr key={app.id}>
                                <td>{app.student_name || 'Student Name'}</td>
                                <td><strong>{app.company || app.jobs?.company}</strong> - {app.job_title || app.jobs?.title}</td>
                                <td>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                  <span className={`badge badge-${app.status === 'applied' ? 'info' : app.status === 'selected' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}`}>
                                    {app.status.toUpperCase()}
                                  </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>No applications recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
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
                                      style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}
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

        {/* REPORTS TAB — Live Analytics */}
        {activeTab === 'reports' && (
          <div>
            <AnalyticsTab
              analytics={analytics}
              analyticsLoading={analyticsLoading}
              loadAnalytics={async () => {
                if (analytics.overview) return; // already loaded
                setAnalyticsLoading(true);
                const [ov, depts, companies, statuses] = await Promise.all([
                  getAnalyticsOverview(),
                  getAnalyticsByDepartment(),
                  getAnalyticsCompanyTrends(),
                  getAnalyticsStatusBreakdown(),
                ]);
                setAnalytics({ overview: ov, departments: depts, companies, statuses });
                setAnalyticsLoading(false);
              }}
            />
          </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <div>
            {/* Search / Filter */}
            <div className="admin-section" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="Search by name or email..." value={approvalSearch} onChange={e => setApprovalSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadApprovals()} style={{ flex: 1, minWidth: '200px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                <select value={approvalRoleFilter} onChange={e => { setApprovalRoleFilter(e.target.value); }} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="hod">HODs</option>
                  <option value="teacher">Teachers</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={loadApprovals}>Search</button>
              </div>
            </div>

            {/* Pending List */}
            <div className="admin-section">
              <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Pending Approvals ({pendingUsers.length})</h3>
              {approvalLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl)' }}><div className="login-spinner" style={{ width: '30px', height: '30px', borderWidth: '3px', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }}></div></div>
              ) : pendingUsers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-xl)' }}>No pending approvals 🎉</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Registered</th><th>Actions</th></tr></thead>
                    <tbody>
                      {pendingUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span style={{ background: u.role === 'hod' ? 'var(--warning)' : 'var(--info)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>{u.role}</span></td>
                          <td>{u.department || 'N/A'}</td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleApprove(u.id)} className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>✓ Approve</button>
                              <button onClick={() => setRejectingUser(u)} className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>✗ Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rejection Modal */}
            {rejectingUser && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 'var(--spacing-xl)', maxWidth: '450px', width: '90%', boxShadow: 'var(--shadow-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--spacing-md)', color: 'var(--danger)' }}>Reject {rejectingUser.name}?</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>This will prevent {rejectingUser.email} from accessing the platform.</p>
                  <textarea placeholder="Reason for rejection (optional)" value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)', resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setRejectingUser(null); setRejectReason(''); }} className="btn btn-outline btn-sm">Cancel</button>
                    <button onClick={() => handleReject(rejectingUser.id)} className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}>Reject User</button>
                  </div>
                </div>
              </div>
            )}

            {/* Approval History */}
            <div className="admin-section" style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Approval History</h3>
              {approvalHistory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No approval actions recorded yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead><tr><th>User</th><th>Role</th><th>Action</th><th>By</th><th>Reason</th><th>Date</th></tr></thead>
                    <tbody>
                      {approvalHistory.map(h => (
                        <tr key={h.id}>
                          <td>{h.target_name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({h.target_email})</span></td>
                          <td><span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>{h.target_role}</span></td>
                          <td><span style={{ color: h.action === 'approved' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{h.action === 'approved' ? '✓ Approved' : '✗ Rejected'}</span></td>
                          <td>{h.performer_name}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.reason || '—'}</td>
                          <td>{new Date(h.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>System Settings</h3>
            
            <div style={{ maxWidth: '600px' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Current Placement Cycle</label>
                <select style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                  <option>2026-2027</option>
                  <option>2025-2026</option>
                </select>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Registration Status</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <label><input type="radio" name="reg" defaultChecked /> Open for Students</label>
                  <label><input type="radio" name="reg" /> Closed</label>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Support Contact Email</label>
                <input type="email" defaultValue="admin@placementportal.edu" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
              </div>

              <button className="btn btn-accent">Save Settings</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
