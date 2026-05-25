import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const Applications = () => {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { getApplications } = useData();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    const fetchApps = async () => {
      if (user) {
        const data = await getApplications(user.id);
        setApplications(data || []);
        setLoading(false);
      }
    };
    fetchApps();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(79,70,229,0.2)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  const filteredApps = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const stats = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1>My Applications</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your job applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Browse More Jobs</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)', overflowX: 'auto', paddingBottom: 'var(--spacing-sm)' }}>
        {['all', 'applied', 'shortlisted', 'interview', 'selected', 'rejected'].map(status => (
           <button 
             key={status}
             className={`btn ${filterStatus === status ? 'btn-secondary' : 'btn-outline'}`}
             onClick={() => setFilterStatus(status)}
             style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}
           >
             {status} ({stats[status] || 0})
           </button>
        ))}
      </div>

      {/* Applications Grid */}
      {filteredApps.length === 0 ? (
         <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>📄</div>
            <h3 style={{ color: 'var(--text-secondary)' }}>No applications found</h3>
            <p>You haven't applied to any jobs with this status yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/jobs')} style={{ marginTop: 'var(--spacing-md)' }}>Find Jobs</button>
         </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {filteredApps.map(app => (
            <div key={app.id} className="card" style={{ borderLeft: '4px solid', borderLeftColor: app.status === 'applied' ? 'var(--info)' : app.status === 'shortlisted' ? 'var(--warning)' : app.status === 'interview' ? 'var(--danger)' : app.status === 'selected' ? 'var(--success)' : 'var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                    <div className={`badge badge-${app.status === 'applied' ? 'info' : app.status === 'shortlisted' ? 'warning' : app.status === 'interview' ? 'danger' : app.status === 'selected' ? 'success' : 'danger'}`}>
                      {app.status.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                </div>
                
                <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{app.jobs?.title || app.job_title || 'Unknown Position'}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {app.jobs?.company?.charAt(0) || 'C'}
                    </div>
                    <strong style={{ color: 'var(--text-secondary)' }}>{app.jobs?.company || 'Unknown Company'}</strong>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                    <div>Location: {app.jobs?.location || 'Remote'}</div>
                    <div>Package: {app.jobs?.package || 'Not specified'}</div>
                </div>

                <div style={{ paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                   <button className="btn btn-ghost btn-sm" onClick={() => setSelectedJob(app.jobs)}>View Details</button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 'var(--spacing-xl)', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)', position: 'relative' }}>
            <button onClick={() => setSelectedJob(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            <h2 style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--primary)' }}>{selectedJob.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
              <strong>{selectedJob.company}</strong>
              <span>📍 {selectedJob.location || 'Remote'}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ background: 'var(--bg-light)', padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Package</div>
                <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{selectedJob.package || 'Not specified'}</div>
              </div>
              <div style={{ background: 'var(--bg-light)', padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Deadline</div>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{new Date(selectedJob.deadline).toLocaleDateString()}</div>
              </div>
            </div>

            <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-xs)' }}>Description</h4>
            <p style={{ lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>{selectedJob.description || 'No description provided.'}</p>
            
            <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-xs)' }}>Requirements</h4>
            <p style={{ lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>{selectedJob.requirements || 'Standard requirements apply.'}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', fontSize: '0.85rem', marginBottom: 'var(--spacing-lg)' }}>
               {selectedJob.job_type && <div><strong>Type:</strong> {selectedJob.job_type}</div>}
               {selectedJob.experience_level && <div><strong>Experience:</strong> {selectedJob.experience_level}</div>}
               {selectedJob.work_mode && <div><strong>Mode:</strong> {selectedJob.work_mode}</div>}
               {selectedJob.company_type && <div><strong>Company:</strong> {selectedJob.company_type}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
              <button onClick={() => setSelectedJob(null)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
