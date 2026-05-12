import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

// ─── Status Timeline Component ─────────────────────────────────────────────
const STAGES = ['applied', 'shortlisted', 'interview', 'selected', 'offer'];

const StatusTimeline = ({ currentStatus }) => {
  const isRejected = currentStatus === 'rejected';
  const currentIdx = isRejected ? -1 : STAGES.indexOf(currentStatus);

  return (
    <div className="status-timeline">
      {STAGES.map((stage, i) => {
        const isDone = !isRejected && i <= currentIdx;
        const isCurrent = !isRejected && i === currentIdx;
        return (
          <React.Fragment key={stage}>
            <div className="timeline-step" style={{ textAlign: 'center', flex: 1 }}>
              <div
                className="timeline-circle"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${isRejected ? 'var(--border-color)' : isDone ? 'var(--success)' : 'var(--border-color)'}`,
                  background: isCurrent ? 'var(--success)' : isDone ? 'var(--success-light)' : 'var(--bg-gray)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isDone ? 'var(--success)' : 'var(--text-muted)',
                  transition: 'all 0.3s ease',
                }}
              >
                {isCurrent ? '●' : isDone ? '✓' : '○'}
              </div>
              <div style={{
                fontSize: '10px',
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? 'var(--success)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}>
                {stage}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                background: !isRejected && i < currentIdx ? 'var(--success)' : 'var(--border-color)',
                alignSelf: 'flex-start',
                marginTop: '13px',
                transition: 'background 0.3s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
      {isRejected && (
        <div style={{ marginLeft: '8px', alignSelf: 'flex-start', marginTop: '6px' }}>
          <span className="badge badge-danger">REJECTED</span>
        </div>
      )}
    </div>
  );
};

// ─── Match Score Ring ──────────────────────────────────────────────────────
const MatchRing = ({ score }) => {
  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={radius} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: 700, color,
      }}>
        {score}%
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { profile, isLoggedIn, loading: authLoading, isPending, isRejected } = useAuth();
  const { getApplications, getSavedJobs, getRecommendations, addApplication } = useData();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState(null);
  const [applyMsg, setApplyMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/');
    if (!authLoading && isLoggedIn && (isPending || isRejected)) navigate('/pending');
  }, [authLoading, isLoggedIn, isPending, isRejected, navigate]);

  useEffect(() => {
    if (!profile) return;
    const loadData = async () => {
      try {
        const [apps, saved, recs] = await Promise.all([
          getApplications(profile.id),
          getSavedJobs(),
          getRecommendations(),
        ]);
        setApplications(apps || []);
        setSavedJobs(saved || []);
        setRecommendations(recs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [profile]);

  const handleQuickApply = async (jobId) => {
    setApplyingTo(jobId);
    setApplyMsg('');
    const { data, error } = await addApplication(profile.id, jobId);
    if (error) {
      setApplyMsg(error.message);
    } else if (data) {
      setApplications(prev => [...prev, data]);
      setRecommendations(prev => prev.map(r => r.id === jobId ? { ...r, already_applied: true } : r));
      setApplyMsg('');
    }
    setApplyingTo(null);
  };

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
        <button onClick={() => navigate('/login')} className="btn btn-primary">Return to Login</button>
      </div>
    );
  }

  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const selectedCount = applications.filter(a => ['selected', 'offer'].includes(a.status)).length;
  const profileFields = ['name', 'email', 'phone', 'department', 'skills', 'cgpa', 'resume_url'];
  const completionPercentage = Math.round(
    (profileFields.filter(f => profile[f]).length / profileFields.length) * 100
  );

  return (
    <div style={{ padding: 'var(--spacing-xl) var(--spacing-md)', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <h1 style={{ margin: 0, color: 'var(--primary)' }}>
              Welcome back, {profile.name?.split(' ')[0]} 👋
            </h1>
            {profile.department && (
              <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{profile.department}</span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 'var(--spacing-sm) 0 0' }}>
            Student Dashboard · CGPA: {profile.cgpa || 'Not set'}
          </p>
        </div>
        <button onClick={() => navigate('/jobs')} className="btn btn-primary">Browse All Jobs →</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        {[
          { label: 'Applications', value: applications.length, color: 'var(--primary)' },
          { label: 'Shortlisted', value: shortlistedCount, color: 'var(--warning)' },
          { label: 'Offers', value: selectedCount, color: 'var(--success)' },
          { label: 'Saved Jobs', value: savedJobs.length, color: 'var(--secondary)' },
          { label: 'Profile %', value: `${completionPercentage}%`, color: completionPercentage < 70 ? 'var(--danger)' : 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Profile incomplete warning */}
      {completionPercentage < 70 && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <span>⚠️</span>
          <div>
            <strong>Complete your profile</strong> to unlock better job matches and improve recommendation accuracy.
            <button onClick={() => navigate('/profile')} className="btn btn-sm btn-outline" style={{ marginLeft: '12px' }}>Update Profile</button>
          </div>
        </div>
      )}

      {/* ── RECOMMENDED JOBS ── */}
      {recommendations.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', padding: 'var(--spacing-md) var(--spacing-lg)', margin: 'calc(-1 * var(--spacing-lg)) calc(-1 * var(--spacing-lg)) var(--spacing-lg)' }}>
            <h3 style={{ margin: 0, color: '#fff' }}>⚡ Recommended for You</h3>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-sm)' }}>
              Matched based on your department, skills, and CGPA
            </p>
          </div>

          {applyMsg && (
            <div className="alert alert-warning" style={{ margin: '0 0 var(--spacing-md)' }}>
              <span>⚠</span> {applyMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {recommendations.map(job => (
              <div key={job.id} style={{
                border: `1px solid ${job.is_eligible ? 'var(--border-color)' : 'var(--border-color-light)'}`,
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: job.is_eligible ? 'var(--bg-white)' : 'var(--bg-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                flexWrap: 'wrap',
              }}>
                <MatchRing score={job.match_score} />

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{job.title}</strong>
                    {job.is_eligible
                      ? <span className="badge badge-success">✓ Eligible</span>
                      : <span className="badge badge-danger">✗ Not Eligible</span>}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {job.company} · {job.location || 'Remote'} · {job.package || 'TBD'}
                  </div>
                  {job.missing_skills?.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Missing:</span>
                      {job.missing_skills.map(s => (
                        <span key={s} style={{
                          background: 'var(--warning-light)',
                          color: '#92400E',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}>{s}</span>
                      ))}
                    </div>
                  )}
                  {job.ineligibility_reasons?.length > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>
                      {job.ineligibility_reasons.join(' · ')}
                    </div>
                  )}
                </div>

                <button
                  className={`btn btn-sm ${job.already_applied || !job.is_eligible ? 'btn-secondary' : 'btn-accent'}`}
                  disabled={job.already_applied || !job.is_eligible || applyingTo === job.id}
                  onClick={() => !job.already_applied && job.is_eligible && handleQuickApply(job.id)}
                  style={{ flexShrink: 0 }}
                >
                  {applyingTo === job.id ? 'Applying...' : job.already_applied ? '✓ Applied' : 'Apply Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }} className="dashboard-grid">
        <style>{`@media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr !important; } }`}</style>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

          {/* Application Progress Tracker */}
          <div className="card">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              📋 Application Progress Tracker
            </h3>
            {applications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {applications.map(app => (
                  <div key={app.id} style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--bg-light)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {app.jobs?.company || app.company}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          {app.jobs?.position || app.position} · Applied {new Date(app.applied_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <StatusTimeline currentStatus={app.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-muted)' }}>
                No applications yet. <a href="/jobs" style={{ color: 'var(--secondary)' }}>Browse available jobs →</a>
              </div>
            )}
          </div>

          {/* Saved Jobs */}
          <div className="card">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              🔖 Saved Jobs
            </h3>
            {savedJobs.length > 0 ? (
              <div className="grid grid-2">
                {savedJobs.map(job => (
                  <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-md)', background: 'var(--bg-light)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{job.position}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>{job.company}</div>
                    <div className="flex-between">
                      <span className="badge badge-secondary">{job.package || 'TBD'}</span>
                      <button onClick={() => navigate('/jobs')} className="btn btn-sm btn-outline">View</button>
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

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

          {/* Profile Overview */}
          <div className="card">
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ margin: 0 }}>Profile</h3>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{completionPercentage}%</div>
            </div>
            <div className="progress-bar" style={{ marginBottom: 'var(--spacing-md)', height: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {profileFields.map(field => {
                const isComplete = !!profile[field];
                return (
                  <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-xs) 0' }}>
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', fontSize: 'var(--font-size-sm)' }}>{field.replace('_url', '')}</span>
                    <span style={{ color: isComplete ? 'var(--success)' : 'var(--danger)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                      {isComplete ? '✓' : '✗ Missing'}
                    </span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => navigate('/profile')} className="btn btn-outline btn-block" style={{ marginTop: 'var(--spacing-lg)' }}>
              Update Profile
            </button>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              ⏰ Upcoming Deadlines
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {savedJobs.filter(j => j.deadline).slice(0, 4).map(job => {
                const daysLeft = Math.ceil((new Date(job.deadline) - Date.now()) / 86400000);
                const urgent = daysLeft <= 3;
                return (
                  <div key={job.id} style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <div style={{
                      background: urgent ? 'var(--danger-light)' : 'var(--info-light)',
                      color: urgent ? 'var(--danger)' : 'var(--info)',
                      padding: '4px 8px',
                      borderRadius: 'var(--border-radius)',
                      fontWeight: 700,
                      textAlign: 'center',
                      minWidth: '50px',
                      fontSize: 'var(--font-size-xs)',
                    }}>
                      {daysLeft > 0 ? `${daysLeft}d` : 'Today!'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{job.company}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>{job.position}</div>
                    </div>
                  </div>
                );
              })}
              {savedJobs.filter(j => j.deadline).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No upcoming deadlines.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
