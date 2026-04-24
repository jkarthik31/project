import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, profile, updateProfile, isLoggedIn, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    cgpa: '',
    skills: '',
    resume_url: '',
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    avatar_url: ''
  });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        department: profile.department || '',
        cgpa: profile.cgpa || '',
        skills: profile.skills || '',
        resume_url: profile.resume_url || '',
        portfolio_url: profile.portfolio_url || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  if (authLoading && !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(79,70,229,0.2)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Profile Not Found</h2>
        <p>Ensure your account setup is complete.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isPhoto = type === 'photo';
    if (isPhoto) setUploadingPhoto(true);
    else setUploadingResume(true);

    const data = new FormData();
    data.append(type, file);

    try {
      const response = await fetch(`http://localhost:5000/api/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      const result = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, [isPhoto ? 'avatar_url' : 'resume_url']: result.url }));
        setStatusMsg({ type: 'success', text: `${isPhoto ? 'Photo' : 'Resume'} uploaded successfully. Please click Save Profile to keep changes.` });
      } else {
        setStatusMsg({ type: 'error', text: result.error || 'Upload failed.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Upload error.' });
    } finally {
      if (isPhoto) setUploadingPhoto(false);
      else setUploadingResume(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg({ type: '', text: '' });

    // Assuming cgpa is numeric, optionally convert it
    const updates = { ...formData };
    if (updates.cgpa) updates.cgpa = parseFloat(updates.cgpa);

    const { error } = await updateProfile(updates);

    if (error) {
       setStatusMsg({ type: 'error', text: error.message || 'Failed to update profile' });
    } else {
       setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
       setIsEditing(false);
    }
    
    setIsSaving(false);
  };

  const calculateCompletion = () => {
     const fieldsCheck = ['name', 'phone', 'department', 'skills', 'cgpa', 'resume_url'];
     let filled = fieldsCheck.filter(f => !!formData[f]).length;
     return Math.round((filled / fieldsCheck.length) * 100);
  };

  const completionAvg = calculateCompletion();

  return (
    <div style={{ padding: '100px 20px 40px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Profile Header Card */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)', position: 'relative', overflow: 'hidden' }}>
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', zIndex: 0 }}></div>
         
         <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-lg)', position: 'relative', zIndex: 1, marginTop: '40px', width: '100%' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', border: '4px solid var(--bg-white)', overflow: 'hidden', position: 'relative' }}>
               {formData.avatar_url ? (
                 <img src={formData.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontSize: '48px', fontWeight: 'bold' }}>
                   {formData.name.charAt(0)?.toUpperCase() || 'U'}
                 </div>
               )}
               {isEditing && (
                 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '4px', textAlign: 'center' }}>
                   <label style={{ color: 'var(--bg-white)', fontSize: '12px', cursor: 'pointer', display: 'block' }}>
                     {uploadingPhoto ? '...' : 'Upload'}
                     <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'photo')} disabled={uploadingPhoto} />
                   </label>
                 </div>
               )}
            </div>
            <div style={{ flex: 1, paddingBottom: '10px' }}>
               <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)' }}>{formData.name || 'Set your name'}</h1>
               <p style={{ margin: '4px 0', fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>{profile.email}</p>
               <span className={`badge badge-${profile.role === 'student' ? 'primary' : 'warning'}`} style={{ textTransform: 'uppercase' }}>
                 {profile.role}
               </span>
            </div>
            {!isEditing && (
              <button className="btn btn-outline" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
         </div>
      </div>

      {statusMsg.text && (
        <div className={`card ${statusMsg.type === 'error' ? 'login-error' : 'login-success'}`} style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
           {statusMsg.text}
        </div>
      )}

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
                  {isEditing ? (
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                  ) : (
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formData.name || '-'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Department</label>
                  {isEditing ? (
                    <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Computer Science" />
                  ) : (
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formData.department || '-'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                  ) : (
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formData.phone || '-'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>CGPA</label>
                  {isEditing ? (
                    <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="8.5" />
                  ) : (
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formData.cgpa || '-'}</p>
                  )}
                </div>
            </div>

            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)' }}>
              Links & Resume
            </h3>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Skills (Comma-separated)</label>
              {isEditing ? (
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python" />
              ) : (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                   {formData.skills ? formData.skills.split(',').map((s,i) => <span key={i} className="badge badge-secondary">{s.trim()}</span>) : '-'}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="form-group">
                  <label>Resume URL</label>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="text" name="resume_url" value={formData.resume_url} onChange={handleChange} placeholder="https://drive.google.com/..." style={{ flex: 1 }} />
                      <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0, padding: '8px 16px', whiteSpace: 'nowrap' }}>
                        {uploadingResume ? '...' : 'Upload PDF'}
                        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'resume')} disabled={uploadingResume} />
                      </label>
                    </div>
                  ) : (
                    <a href={formData.resume_url || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      {formData.resume_url ? 'View Resume 🔗' : '-'}
                    </a>
                  )}
                </div>

                <div className="form-group">
                  <label>LinkedIn URL</label>
                  {isEditing ? (
                    <input type="text" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/..." />
                  ) : (
                    <a href={formData.linkedin_url || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      {formData.linkedin_url ? 'View Profile 🔗' : '-'}
                    </a>
                  )}
                </div>

                <div className="form-group">
                  <label>GitHub URL</label>
                  {isEditing ? (
                    <input type="text" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/..." />
                  ) : (
                    <a href={formData.github_url || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      {formData.github_url ? 'View Repositories 🔗' : '-'}
                    </a>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Portfolio URL</label>
                  {isEditing ? (
                    <input type="text" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://..." />
                  ) : (
                    <a href={formData.portfolio_url || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      {formData.portfolio_url ? 'View Portfolio 🔗' : '-'}
                    </a>
                  )}
                </div>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)', justifyContent: 'flex-end', borderTop: '2px solid var(--border-color)', paddingTop: 'var(--spacing-lg)' }}>
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
         </div>

         <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 var(--spacing-sm)' }}>Profile Status</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>A complete profile attracts more recruiters.</p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-lg)' }}>
               <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: `conic-gradient(var(--secondary) ${completionAvg}%, var(--border-color) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'var(--bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                     <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{completionAvg}%</span>
                  </div>
               </div>
            </div>

            {!isEditing && completionAvg < 100 && (
              <button className="btn btn-primary btn-block" onClick={() => setIsEditing(true)}>Complete Profile</button>
            )}
         </div>
      </div>
    </div>
  );
};

export default Profile;
