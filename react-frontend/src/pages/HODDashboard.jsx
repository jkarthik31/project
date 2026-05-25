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

const HODDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getDashboardStats, getApplications, getJobs, createJob, updateJob, deleteJob, updateApplicationStatus, getProfilesByDepartment,
          getPendingApprovals, getApprovalHistory, approveUser, rejectUser, getAnalyticsByDepartment } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalStudents: 0, totalApplications: 0, totalJobs: 0 });
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState({});

  // New Job Form State
  const [newJob, setNewJob] = useState({ 
    title: '', 
    company: '', 
    position: '', 
    location: '', 
    deadline: '', 
    status: 'active',
    allowed_departments: [],
    description: '',
    package: '',
    required_skills: '',
    job_type: 'Full-time',
    experience_level: 'Fresher',
    work_mode: 'On-site',
    company_type: 'IT Services'
  });
  const [jobCreating, setJobCreating] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Analytics State
  const [deptAnalytics, setDeptAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Common options for dropdowns
  const departments = ['BCA', 'BBA', 'BA', 'BCom', 'BSC'];
  const locations = ['Bengaluru', 'Delhi', 'Hyderabad', 'Chennai'];
  const jobTypes = ['Full-time', 'Internship', 'Part-time', 'Contract'];
  const experienceLevels = ['Fresher', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'];
  const workModes = ['On-site', 'Remote', 'Hybrid'];

  // Student Approval State
  const [pendingStudents, setPendingStudents] = useState([]);
  const [studentApprovalHistory, setStudentApprovalHistory] = useState([]);
  const [rejectingStudent, setRejectingStudent] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalLoading, setApprovalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login?role=hod');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (user && profile) {
        const [dashStats, apps, jobsData, profileData] = await Promise.all([
          getDashboardStats(),
          getApplications(),
          getJobs(),
          getProfilesByDepartment(profile.department)
        ]);
        setStats(dashStats || { totalStudents: 0, totalApplications: 0, totalJobs: 0 });
        setApplications(apps || []);
        setJobs(jobsData || []);
        
        const allProfiles = profileData || [];
        setStudents(allProfiles.filter(p => p.role === 'student'));
        setTeachers(allProfiles.filter(p => p.role === 'teacher'));
        setLoading(false);
      }
    };
    if (profile) loadData();
  }, [user, profile]);

  const loadDeptAnalytics = async () => {
    setAnalyticsLoading(true);
    const depts = await getAnalyticsByDepartment();
    const myDept = depts.find(d => d.department === profile.department);
    setDeptAnalytics(myDept);
    setAnalyticsLoading(false);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setJobCreating(true);
    
    // If no departments selected, default to HOD's department
    const selectedDepts = newJob.allowed_departments.length > 0 
      ? newJob.allowed_departments.join(',') 
      : profile.department;

    if (editingJob) {
      const { data, error } = await updateJob(editingJob.id, {
        ...newJob,
        allowed_departments: selectedDepts
      });
      if (!error && data) {
        setJobs(jobs.map(j => j.id === editingJob.id ? data : j));
        setEditingJob(null);
        setNewJob({ 
          title: '', company: '', position: '', location: '', deadline: '', status: 'active',
          allowed_departments: [],
          description: '', package: '', required_skills: '',
          job_type: 'Full-time', experience_level: 'Fresher', work_mode: 'On-site', company_type: 'IT Services'
        });
      }
    } else {
      const { data, error } = await createJob({
        ...newJob,
        allowed_departments: selectedDepts
      });
      if (!error && data) {
        setJobs([data, ...jobs]);
        setNewJob({ 
          title: '', company: '', position: '', location: '', deadline: '', status: 'active',
          allowed_departments: [],
          description: '', package: '', required_skills: '',
          job_type: 'Full-time', experience_level: 'Fresher', work_mode: 'On-site', company_type: 'IT Services'
        });
      }
    }
    setJobCreating(false);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title || '',
      company: job.company || '',
      position: job.position || '',
      location: job.location || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      status: job.status || 'active',
      allowed_departments: job.allowed_departments ? job.allowed_departments.split(',') : [],
      description: job.description || '',
      package: job.package || '',
      required_skills: job.required_skills || '',
      job_type: job.job_type || 'Full-time',
      experience_level: job.experience_level || 'Fresher',
      work_mode: job.work_mode || 'On-site',
      company_type: job.company_type || 'IT Services'
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Student approval handlers
  const loadStudentApprovals = async () => {
    setApprovalLoading(true);
    const [pending, history] = await Promise.all([
      getPendingApprovals(),
      getApprovalHistory(),
    ]);
    setPendingStudents(pending);
    setStudentApprovalHistory(history);
    setApprovalLoading(false);
  };

  const handleApproveStudent = async (userId) => {
    const { error } = await approveUser(userId);
    if (!error) {
      setPendingStudents(prev => prev.filter(u => u.id !== userId));
      setStats(s => ({ ...s, totalStudents: (s.totalStudents || 0) + 1 }));
      loadStudentApprovals();
    }
  };

  const handleRejectStudent = async (userId) => {
    const { error } = await rejectUser(userId, rejectReason);
    if (!error) {
      setPendingStudents(prev => prev.filter(u => u.id !== userId));
      setRejectingStudent(null);
      setRejectReason('');
      loadStudentApprovals();
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
      <aside className="admin-sidebar">
        <ul className="admin-menu">
            <li><button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button></li>
            <li><button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>My Students</button></li>
            <li><button className={activeTab === 'teachers' ? 'active' : ''} onClick={() => setActiveTab('teachers')}>Teachers</button></li>
            <li><button className={activeTab === 'student-approvals' ? 'active' : ''} onClick={() => { setActiveTab('student-approvals'); loadStudentApprovals(); }} style={{ position: 'relative' }}>Student Approvals {pendingStudents.length > 0 && <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', marginLeft: '4px' }}>{pendingStudents.length}</span>}</button></li>
            <li><button className={activeTab === 'jobs' ? 'active' : ''} onClick={() => setActiveTab('jobs')}>Jobs</button></li>
            <li><button className={activeTab === 'approvals' ? 'active' : ''} onClick={() => setActiveTab('approvals')}>Application Status</button></li>
            <li><button className={activeTab === 'reports' ? 'active' : ''} onClick={() => { setActiveTab('reports'); loadDeptAnalytics(); }}>Dept Reports</button></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-header">
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <h1 style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--primary)' }}>
                    HOD Dashboard
                  </h1>
                  {profile.department && (
                    <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{profile.department}</span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome back, {profile.name || 'HOD User'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontWeight: 'bold' }}>
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
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary)' }}>{students.length || stats.totalStudents}</div>
                </div>

                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Total Applications</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--success)' }}>{applications.length || stats.totalApplications}</div>
                </div>

                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Approvals</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)' }}>{pendingStudents.length}</div>
                </div>
                
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--info)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Active Jobs</div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--info)' }}>{stats.totalJobs || jobs.length || 0}</div>
                </div>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Students in {profile.department}</h3>
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
                                  <button 
                                    className="btn btn-ghost btn-sm" 
                                    style={{ color: 'var(--info)' }}
                                    onClick={() => navigate(`/profile/${student.id}`)}
                                  >
                                    View Profile
                                  </button>
                                </td>
                            </tr>
                            );
                        }) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>No students found in your department.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* TEACHERS TAB */}
        {activeTab === 'teachers' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Teachers in {profile.department}</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Verification</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.length > 0 ? teachers.map(teacher => (
                            <tr key={teacher.id}>
                                <td>{teacher.name || 'Unnamed Teacher'}</td>
                                <td>{teacher.email}</td>
                                <td>
                                  <span className={`badge badge-${teacher.approval_status === 'approved' ? 'success' : teacher.approval_status === 'pending' ? 'warning' : 'danger'}`}>
                                    {teacher.approval_status.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-ghost btn-sm" 
                                    style={{ color: 'var(--info)' }}
                                    onClick={() => navigate(`/profile/${teacher.id}`)}
                                  >
                                    View Profile
                                  </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>No teachers found in your department.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* APPROVALS TAB (renamed to Application Status) */}
        {activeTab === 'approvals' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Student Applications & Status</h3>
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
            
            <div style={{ background: 'var(--bg-gray)', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--spacing-xl)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>{editingJob ? 'Edit Job' : `Post New Job for ${profile.department}`}</h4>
              <form onSubmit={handleCreateJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Job Title *</label>
                  <input type="text" placeholder="e.g. Java Developer" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                </div>
                
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Position / Role *</label>
                  <input type="text" placeholder="e.g. Associate Software Engineer" required value={newJob.position} onChange={e => setNewJob({...newJob, position: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Company Name *</label>
                  <input type="text" placeholder="e.g. TCS" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description *</label>
                  <textarea placeholder="Job description and details..." required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical' }} />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Salary Package *</label>
                  <input type="text" placeholder="e.g. 4.5 LPA" required value={newJob.package} onChange={e => setNewJob({...newJob, package: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Last Date to Apply *</label>
                  <input type="date" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Skills Required (Comma separated) *</label>
                  <input type="text" placeholder="e.g. Java, Spring Boot, MySQL" required value={newJob.required_skills} onChange={e => setNewJob({...newJob, required_skills: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Eligible Departments *</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', background: 'var(--bg-white)', padding: 'var(--spacing-sm)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    {departments.map(d => (
                      <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'normal', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={newJob.allowed_departments.includes(d)} onChange={e => {
                          const depts = e.target.checked
                            ? [...newJob.allowed_departments, d]
                            : newJob.allowed_departments.filter(x => x !== d);
                          setNewJob({...newJob, allowed_departments: depts});
                        }} />
                        {d}
                      </label>
                    ))}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem', marginLeft: 'auto' }}>
                      <input type="checkbox" checked={newJob.allowed_departments.length === 0} onChange={() => setNewJob({...newJob, allowed_departments: []})} />
                      My Dept Only ({profile.department})
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Job Type</label>
                  <select value={newJob.job_type} onChange={e => setNewJob({...newJob, job_type: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                    {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Location</label>
                  <select value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                    <option value="">Select Location</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Experience Level</label>
                  <select value={newJob.experience_level} onChange={e => setNewJob({...newJob, experience_level: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                    {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Work Mode</label>
                  <select value={newJob.work_mode} onChange={e => setNewJob({...newJob, work_mode: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                    {workModes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Company Type</label>
                  <input type="text" placeholder="e.g. IT Services" value={newJob.company_type} onChange={e => setNewJob({...newJob, company_type: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                  <button type="submit" disabled={jobCreating} className="btn btn-accent" style={{ flex: 1, padding: '0.8rem' }}>
                    {jobCreating ? 'Processing...' : editingJob ? 'Update Job' : 'Post Job'}
                  </button>
                  {editingJob && (
                    <button type="button" onClick={() => { setEditingJob(null); setNewJob({ title: '', company: '', position: '', location: '', deadline: '', status: 'active', allowed_departments: [], description: '', package: '', required_skills: '', job_type: 'Full-time', experience_level: 'Fresher', work_mode: 'On-site', company_type: 'IT Services' }); }} className="btn btn-outline" style={{ padding: '0.8rem' }}>
                      Cancel
                    </button>
                  )}
                </div>
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
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button onClick={() => handleEditJob(job)} className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Edit</button>
                                      <button onClick={() => handleDeleteJob(job.id)} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Delete</button>
                                    </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Department Placement Reports</h3>
            
            <div className="admin-stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--info)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Placement Rate</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--info)' }}>
                      {students.length ? Math.round((applications.filter(a => a.status === 'selected').length / students.length) * 100) : 0}%
                    </div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Offers Extended</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--success)' }}>
                      {applications.filter(a => a.status === 'selected').length}
                    </div>
                </div>
            </div>

            {analyticsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                <div className="login-spinner" style={{ width: '30px', height: '30px', borderWidth: '3px', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }}></div>
              </div>
            ) : deptAnalytics ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>Application Status Breakdown</h4>
                  <BarChart 
                    data={[
                      { status: 'Applied', count: applications.filter(a => a.status === 'applied').length },
                      { status: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length },
                      { status: 'Interview', count: applications.filter(a => a.status === 'interview').length },
                      { status: 'Selected', count: applications.filter(a => a.status === 'selected').length },
                      { status: 'Offer', count: applications.filter(a => a.status === 'offer').length },
                      { status: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
                    ]} 
                    labelKey="status" 
                    valueKey="count" 
                    color="var(--secondary)" 
                  />
                </div>
                <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>Department Summary</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Students:</span>
                      <strong>{deptAnalytics.unique_students}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Applications:</span>
                      <strong>{deptAnalytics.total_applications}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Students Placed:</span>
                      <strong style={{ color: 'var(--success)' }}>{deptAnalytics.placed}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-sm)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Placement Rate:</span>
                      <strong style={{ color: 'var(--primary)', fontSize: 'var(--font-size-lg)' }}>
                        {deptAnalytics.unique_students > 0 ? Math.round((deptAnalytics.placed / deptAnalytics.unique_students) * 100) : 0}%
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius-lg)', background: 'var(--bg-light)' }}>
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📊</div>
                  <h4 style={{ color: 'var(--text-primary)' }}>Graphical Reports</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Detailed analytics for {profile.department} will appear once applications are processed.</p>
              </div>
            )}
            
            <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                <button className="btn btn-primary">Export CSV Report</button>
            </div>
          </div>
        )}

        {/* STUDENT APPROVALS TAB (Registration Approvals) */}
        {activeTab === 'student-approvals' && (
          <div>
            <div className="admin-section">
              <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Pending Student Registrations — {profile.department}</h3>
              {approvalLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl)' }}><div className="login-spinner" style={{ width: '30px', height: '30px', borderWidth: '3px', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }}></div></div>
              ) : pendingStudents.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-xl)' }}>No pending student registrations 🎉</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Registered</th><th>Actions</th></tr></thead>
                    <tbody>
                      {pendingStudents.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.department || 'N/A'}</td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleApproveStudent(u.id)} style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>✓ Approve</button>
                              <button onClick={() => setRejectingStudent(u)} style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>✗ Reject</button>
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
            {rejectingStudent && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 'var(--spacing-xl)', maxWidth: '450px', width: '90%', boxShadow: 'var(--shadow-lg)' }}>
                  <h3 style={{ margin: '0 0 var(--spacing-md)', color: 'var(--danger)' }}>Reject {rejectingStudent.name}?</h3>
                  <textarea placeholder="Reason for rejection (optional)" value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: 'var(--spacing-md)', resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setRejectingStudent(null); setRejectReason(''); }} className="btn btn-outline btn-sm">Cancel</button>
                    <button onClick={() => handleRejectStudent(rejectingStudent.id)} style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {studentApprovalHistory.length > 0 && (
              <div className="admin-section" style={{ marginTop: 'var(--spacing-lg)' }}>
                <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Approval History</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead><tr><th>Student</th><th>Action</th><th>Reason</th><th>Date</th></tr></thead>
                    <tbody>
                      {studentApprovalHistory.map(h => (
                        <tr key={h.id}>
                          <td>{h.target_name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({h.target_email})</span></td>
                          <td><span style={{ color: h.action === 'approved' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{h.action === 'approved' ? '✓ Approved' : '✗ Rejected'}</span></td>
                          <td>{h.reason || '—'}</td>
                          <td>{new Date(h.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default HODDashboard;
