import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProfileById } = useData();
  const { profile: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const data = await getProfileById(id);
      if (data) {
        setProfile(data);
      } else {
        setError('Profile not found');
      }
      setLoading(false);
    };
    if (id) fetchProfile();
  }, [id, getProfileById]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(79,70,229,0.2)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>{error || 'Profile Not Found'}</h2>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ maxWidth: '900px' }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--spacing-md)' }}>
        ← Back
      </button>

      {/* Profile Header Card */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)', position: 'relative', overflow: 'hidden' }}>
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', zIndex: 0 }}></div>
         
         <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-lg)', position: 'relative', zIndex: 1, marginTop: '40px', width: '100%' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', border: '4px solid var(--bg-white)', overflow: 'hidden', position: 'relative' }}>
               {profile.avatar_url ? (
                 <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontSize: '48px', fontWeight: 'bold' }}>
                   {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                 </div>
               )}
            </div>
            <div style={{ flex: 1, paddingBottom: '10px' }}>
               <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)' }}>{profile.name}</h1>
               <p style={{ margin: '4px 0', fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>{profile.email}</p>
               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                 <span className={`badge badge-${profile.role === 'student' ? 'primary' : 'warning'}`} style={{ textTransform: 'uppercase' }}>
                   {profile.role}
                 </span>
                 {profile.department && (
                   <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                     {profile.department}
                   </span>
                 )}
               </div>
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr)', gap: 'var(--spacing-xl)' }} className="profile-grid">
         <style>{`
          @media (min-width: 768px) {
            .profile-grid { grid-template-columns: 2fr 1fr !important; }
          }
        `}</style>

         <div className="card">
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile.name || '-'}</p>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile.department || '-'}</p>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile.phone || '-'}</p>
                </div>

                <div className="form-group">
                  <label>CGPA</label>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile.cgpa || '-'}</p>
                </div>
            </div>

            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)' }}>
              Links & Resume
            </h3>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Skills</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                 {profile.skills ? profile.skills.split(',').map((s,i) => <span key={i} className="badge badge-secondary">{s.trim()}</span>) : '-'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="form-group">
                  <label>Resume</label>
                  {profile.resume_url ? (
                    <a href={profile.resume_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ width: 'fit-content' }}>
                      View Resume 🔗
                    </a>
                  ) : <p>-</p>}
                </div>

                <div className="form-group">
                  <label>LinkedIn</label>
                  {profile.linkedin_url ? (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      View Profile 🔗
                    </a>
                  ) : <p>-</p>}
                </div>

                <div className="form-group">
                  <label>GitHub</label>
                  {profile.github_url ? (
                    <a href={profile.github_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      View Repositories 🔗
                    </a>
                  ) : <p>-</p>}
                </div>
                
                <div className="form-group">
                  <label>Portfolio</label>
                  {profile.portfolio_url ? (
                    <a href={profile.portfolio_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      View Portfolio 🔗
                    </a>
                  ) : <p>-</p>}
                </div>
            </div>
         </div>

         <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 var(--spacing-sm)' }}>Profile Completion</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'var(--spacing-lg) 0' }}>
               <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(var(--secondary) ${profile.profile_completion || 0}%, var(--border-color) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{profile.profile_completion || 0}%</span>
                  </div>
               </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
         </div>
      </div>
    </div>
  );
};

export default ViewProfile;
