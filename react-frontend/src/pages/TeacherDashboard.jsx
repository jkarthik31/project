import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const TeacherDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getDashboardStats, getApplications, updateApplicationStatus, getProfilesByDepartment, updateProfileVerification } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalStudents: 0, totalApplications: 0 });
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState({});

  // Verification state
  const [verifyingStudent, setVerifyingStudent] = useState(null);
  const [verificationForm, setVerificationForm] = useState({
    resume_status: '',
    resume_remarks: '',
    eligibility_status: '',
    eligibility_remarks: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login?role=teacher');
    }
  }, [authLoading, isLoggedIn, navigate]);

  const loadData = async () => {
    if (user && profile) {
      const dashStats = await getDashboardStats();
      setStats(dashStats);
      
      const apps = await getApplications();
      setApplications(apps);
      
      // Get students from own department only
      const studentData = await getProfilesByDepartment(profile.department);
      setStudents(studentData.filter(p => p.role === 'student'));
      
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile]);

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

  const handleOpenVerification = (student) => {
    setVerifyingStudent(student);
    setVerificationForm({
      resume_status: student.resume_status || 'Pending',
      resume_remarks: student.resume_remarks || '',
      eligibility_status: student.eligibility_status || 'Training Pending',
      eligibility_remarks: student.eligibility_remarks || ''
    });
  };

  const handleUpdateVerification = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const { error } = await updateProfileVerification(verifyingStudent.id, verificationForm);
    if (!error) {
      setStudents(students.map(s => s.id === verifyingStudent.id ? { ...s, ...verificationForm } : s));
      setVerifyingStudent(null);
      
      // Force reload data to ensure all components are in sync
      setTimeout(() => {
        loadData();
      }, 500);
      
      alert('Verification updated successfully!');
    } else {
      alert(error.message);
    }
    setIsUpdating(false);
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
            <li><button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>Students</button></li>
            <li><button className={activeTab === 'verifications' ? 'active' : ''} onClick={() => setActiveTab('verifications')}>Verification & Eligibility</button></li>
            <li><button className={activeTab === 'evaluations' ? 'active' : ''} onClick={() => setActiveTab('evaluations')}>Application Tracking</button></li>
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
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>My Students</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary)' }}>{students.length}</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Active Applications</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--warning)' }}>{applications.length}</div>
                </div>
                <div className="admin-stat-card" style={{ borderLeftColor: 'var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', fontWeight: 600 }}>Verified Resumes</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--success)' }}>{students.filter(s => s.resume_status === 'Approved').length}</div>
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
                            <th>Email</th>
                            <th>CGPA</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? students.map(student => (
                            <tr key={student.id}>
                                <td style={{ fontWeight: 600 }}>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.cgpa || 'N/A'}</td>
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
                        )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>No students found in your department.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* VERIFICATIONS TAB */}
        {activeTab === 'verifications' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Resume Verification & Eligibility</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Resume Status</th>
                            <th>Eligibility</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? students.map(student => (
                            <tr key={student.id}>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{student.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{student.email}</div>
                                </td>
                                <td>
                                  <span className={`badge badge-${student.resume_status === 'Approved' ? 'success' : student.resume_status === 'Needs Revision' ? 'danger' : 'warning'}`}>
                                    {(student.resume_status || 'Pending').toUpperCase()}
                                  </span>
                                  {student.resume_remarks && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '150px' }}>"{student.resume_remarks}"</div>}
                                </td>
                                <td>
                                  <span className={`badge badge-${student.eligibility_status === 'Eligible for Placement' ? 'success' : student.eligibility_status === 'Not Eligible' ? 'danger' : 'info'}`}>
                                    {(student.eligibility_status || 'Training Pending').toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <button className="btn btn-primary btn-sm" onClick={() => handleOpenVerification(student)}>Verify</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No students found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* EVALUATIONS TAB (renamed to Application Tracking) */}
        {activeTab === 'evaluations' && (
          <div className="admin-section">
            <h3 style={{ margin: '0 0 var(--spacing-lg) 0', color: 'var(--primary)' }}>Department Application Status Tracking</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Application Details</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length > 0 ? applications.map(app => (
                            <tr key={app.id}>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{app.student_name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{app.student_email}</div>
                                </td>
                                <td>Applied to <strong>{app.company}</strong> for {app.job_title}</td>
                                <td>
                                  <span className={`badge badge-${app.status === 'applied' ? 'info' : app.status === 'selected' || app.status === 'offer' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}`}>
                                    {app.status.toUpperCase()}
                                  </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>No active applications for your department.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

      </main>

      {/* Verification Modal - Moved outside main for better visibility */}
      {verifyingStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 'var(--spacing-xl)', maxWidth: '500px', width: '90%', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)', position: 'relative' }}>
            <button onClick={() => setVerifyingStudent(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            <h3 style={{ margin: '0 0 var(--spacing-md)', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Verification: {verifyingStudent.name}</h3>
            <form onSubmit={handleUpdateVerification}>
              <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Resume Status</label>
                <select value={verificationForm.resume_status} onChange={e => setVerificationForm({...verificationForm, resume_status: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Needs Revision">Needs Revision</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Resume Remarks</label>
                <textarea value={verificationForm.resume_remarks} onChange={e => setVerificationForm({...verificationForm, resume_remarks: e.target.value})} placeholder="Feedback for the student..." rows={3} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)', resize: 'vertical' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Placement Eligibility</label>
                <select value={verificationForm.eligibility_status} onChange={e => setVerificationForm({...verificationForm, eligibility_status: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}>
                  <option value="Eligible for Placement">Eligible for Placement</option>
                  <option value="Not Eligible">Not Eligible</option>
                  <option value="Training Pending">Training Pending</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Eligibility Remarks</label>
                <textarea value={verificationForm.eligibility_remarks} onChange={e => setVerificationForm({...verificationForm, eligibility_remarks: e.target.value})} placeholder="Reasoning for eligibility status..." rows={2} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-primary)', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <button type="button" onClick={() => setVerifyingStudent(null)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={isUpdating} className="btn btn-primary" style={{ minWidth: '140px' }}>
                  {isUpdating ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
