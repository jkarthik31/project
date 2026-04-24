import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getApplications, getSavedJobs } = useData();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!profile) return;
    
    const loadData = async () => {
      try {
        const [apps, saved] = await Promise.all([
          getApplications(profile.id),
          getSavedJobs()
        ]);
        setApplications(apps || []);
        setSavedJobs(saved || []);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    
    loadData();
  }, [profile]);

  if (authLoading || dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Profile Not Found</h2>
        <p>Your user profile could not be loaded.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">Return to Login</button>
      </div>
    );
  }

  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;

  const profileFields = ['name', 'email', 'phone', 'department', 'skills', 'cgpa', 'resume_url'];
  const completedFields = profileFields.filter(field => profile[field]);
  const completionPercentage = Math.round((completedFields.length / profileFields.length) * 100);

  return (
    <div style={{ padding: 'var(--spacing-xl) var(--spacing-md)', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--secondary)' }}>
            Welcome back, {profile.name?.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 'var(--spacing-sm) 0 0' }}>Here's your placement overview.</p>
        </div>
        <button onClick={() => navigate('/jobs')} className="btn btn-primary">Browse Jobs</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <div className="card" style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Applications</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary)' }}>{applications.length}</div>
        </div>
        <div className="card" style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Shortlisted</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--warning)' }}>{shortlistedCount}</div>
        </div>
        <div className="card" style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Offers</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--success)' }}>{selectedCount}</div>
        </div>
        <div className="card" style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Saved Jobs</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--secondary)' }}>{savedJobs.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }} className="dashboard-grid">
        <style>{`
          @media (max-width: 900px) {
            .dashboard-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          
          {/* Applications Tracker */}
          <div className="card">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>Application Tracker</h3>
            {applications.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ boxShadow: 'none' }}>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Applied On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.jobs?.company || app.company}</td>
                        <td>{app.jobs?.position || app.position}</td>
                        <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${app.status === 'applied' ? 'info' : app.status === 'shortlisted' ? 'warning' : app.status === 'selected' ? 'success' : 'danger'}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-muted)' }}>
                No applications found. <a href="/jobs">Browse available jobs</a>.
              </div>
            )}
          </div>

          {/* Saved Jobs */}
          <div className="card">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>Saved Jobs</h3>
            {savedJobs.length > 0 ? (
              <div className="grid grid-2">
                {savedJobs.map(job => (
                  <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-md)', background: 'var(--bg-light)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{job.position}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>{job.company}</div>
                    <div className="flex-between">
                      <span className="badge badge-secondary">{job.package || 'TBD'}</span>
                      <button onClick={() => navigate(`/jobs`)} className="btn btn-sm btn-outline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-muted)' }}>
                You haven't saved any jobs yet.
              </div>
            )}
          </div>
          
        </div>

        {/* Sidebar Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          
          {/* Profile Overview */}
          <div className="card">
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ margin: 0 }}>Profile Overview</h3>
              <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{completionPercentage}%</div>
            </div>
            
            <div className="progress-bar" style={{ marginBottom: 'var(--spacing-md)', height: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {profileFields.map(field => {
                const isComplete = !!profile[field];
                return (
                  <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-xs) 0' }}>
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{field.replace('_url', '')}</span>
                    <span style={{ color: isComplete ? 'var(--success)' : 'var(--danger)' }}>{isComplete ? 'Complete' : 'Missing'}</span>
                  </div>
                )
              })}
            </div>
            <button onClick={() => navigate('/profile')} className="btn btn-outline btn-block" style={{ marginTop: 'var(--spacing-lg)' }}>Update Profile</button>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>Upcoming Deadlines</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {savedJobs.filter(j => j.deadline).slice(0, 3).map(job => (
                <div key={job.id} style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--border-radius)', fontWeight: 600, textAlign: 'center', minWidth: '45px' }}>
                    {new Date(job.deadline).getDate()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{job.company}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>{job.position}</div>
                  </div>
                </div>
              ))}
              {savedJobs.filter(j => j.deadline).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No upcoming deadlines from your saved jobs.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
