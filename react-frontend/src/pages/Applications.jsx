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
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto', background: 'var(--bg-light)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ margin: 0 }}>My Applications</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 'var(--spacing-sm) 0 0' }}>Track and manage your job applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Browse More Jobs</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)', overflowX: 'auto', paddingBottom: 'var(--spacing-sm)' }}>
        {['all', 'applied', 'shortlisted', 'selected', 'rejected'].map(status => (
           <button 
             key={status}
             className={`btn ${filterStatus === status ? 'btn-secondary' : 'btn-outline'}`}
             onClick={() => setFilterStatus(status)}
             style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}
           >
             {status} ({stats[status]})
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
            <div key={app.id} className="card" style={{ borderLeft: '4px solid', borderLeftColor: app.status === 'applied' ? 'var(--info)' : app.status === 'shortlisted' ? 'var(--warning)' : app.status === 'selected' ? 'var(--success)' : 'var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                    <div className={`badge badge-${app.status === 'applied' ? 'info' : app.status === 'shortlisted' ? 'warning' : app.status === 'selected' ? 'success' : 'danger'}`}>
                      {app.status.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                </div>
                
                <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{app.jobs?.position || 'Unknown Position'}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      {app.jobs?.company?.charAt(0) || 'C'}
                    </div>
                    <strong style={{ color: 'var(--text-secondary)' }}>{app.jobs?.company || 'Unknown Company'}</strong>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                    <div>Location: {app.jobs?.location || 'Remote'}</div>
                    <div>Package: {app.jobs?.package || 'Not specified'}</div>
                </div>

                <div style={{ paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                   <button className="btn btn-ghost btn-sm">View Details</button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
