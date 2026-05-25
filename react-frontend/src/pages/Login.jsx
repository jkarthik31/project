import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, isLoggedIn, profile, isPending, isRejected } = useAuth();
  const navigate = useNavigate();
  const requestedRole = searchParams.get('role') || 'student';
  const roleFromUrl = ['student', 'teacher', 'hod', 'admin'].includes(requestedRole) ? requestedRole : 'student';
  const roleLabel = roleFromUrl === 'hod' ? 'HOD' : roleFromUrl.charAt(0).toUpperCase() + roleFromUrl.slice(1);
  const roleInitial = roleFromUrl === 'admin' ? 'A' : roleFromUrl === 'hod' ? 'H' : roleFromUrl === 'teacher' ? 'T' : 'S';

  const setRole = (role) => {
    setError('');
    setSuccess('');
    setDepartment('');
    if (role === 'admin') setIsSignUp(false);
    navigate(`/?role=${role}`, { replace: true });
  };

  const handlePageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--page-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--page-y', `${e.clientY - rect.top}px`);
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;

    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
    e.currentTarget.style.setProperty('--rotate-x', `${rotateX}deg`);
    e.currentTarget.style.setProperty('--rotate-y', `${rotateY}deg`);
  };

  const handleCardMouseLeave = (e) => {
    e.currentTarget.style.setProperty('--rotate-x', '0deg');
    e.currentTarget.style.setProperty('--rotate-y', '0deg');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        if (!name.trim()) {
          setError('Please enter your name.');
          setIsLoading(false);
          return;
        }
        // Require department for student, teacher, and HOD signups
        if (['student', 'teacher', 'hod'].includes(roleFromUrl) && !department) {
          setError('Please select your department.');
          setIsLoading(false);
          return;
        }
        const { data, error: signUpError } = await signUp(email, password, name, roleFromUrl, department || null);
        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
        } else {
          // Check if the new account is pending approval
          const approvalStatus = data?.profile?.approval_status;
          if (approvalStatus === 'pending') {
            setSuccess('Account created! Your account is awaiting approval from your administrator.');
            setIsLoading(false);
            // Navigate to pending page after a brief delay
            setTimeout(() => navigate('/pending'), 1500);
          } else {
            setSuccess('Account created successfully!');
            setIsLoading(false);
          }
        }
      } else {
        // Sign In
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          if (signInError.approval_status === 'rejected') {
            setError(`Account rejected. ${signInError.rejection_reason ? `Reason: ${signInError.rejection_reason}` : 'Please contact the administrator.'}`);
          } else {
            setError(signInError.message);
          }
          setIsLoading(false);
        }
        // If successful, the useEffect below handles redirect
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Auto-redirect once logged in and profile is loaded
  React.useEffect(() => {
    if (roleFromUrl === 'admin' && isSignUp) {
      setIsSignUp(false);
    }
  }, [roleFromUrl, isSignUp]);

  React.useEffect(() => {
    if (isLoggedIn && profile) {
      // Check approval status before redirecting to dashboard
      if (isPending || isRejected) {
        navigate('/pending');
        return;
      }

      switch (profile.role) {
        case 'admin': navigate('/admin'); break;
        case 'hod': navigate('/hod'); break;
        case 'teacher': navigate('/teacher'); break;
        default: navigate('/dashboard');
      }
    }
  }, [isLoggedIn, profile, isPending, isRejected, navigate]);


  return (
    <section className="login-page" onMouseMove={handlePageMouseMove}>
      <div className="login-particles" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div
        className="login-shell"
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <div className="login-side-panel">
          <div>
            <div className="login-brand-mark">CN</div>
            <h1>Campus Nexus</h1>
            <p>Access placements, approvals, and student progress from one secure portal.</p>
          </div>

          <div className="login-role-section">
            <span className="login-section-label">Choose access</span>
            <div className="login-role-grid">
              <button
                type="button"
                className={`login-role-option ${roleFromUrl === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`login-role-option ${roleFromUrl === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                Admin
              </button>
            </div>

            <div className="login-college-section">
              <div className="login-college-heading">
                <span>College</span>
                <small>Faculty access</small>
              </div>
              <div className="login-role-grid">
                <button
                  type="button"
                  className={`login-role-option ${roleFromUrl === 'teacher' ? 'active' : ''}`}
                  onClick={() => setRole('teacher')}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  className={`login-role-option ${roleFromUrl === 'hod' ? 'active' : ''}`}
                  onClick={() => setRole('hod')}
                >
                  HOD
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="login-card">
            <div className="login-header">
              <div className="login-role-badge">
              {roleInitial}
              </div>
              <span className="login-role-pill">{roleLabel}</span>
            </div>

            <h2 className="login-title">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="login-subtitle">
              {isSignUp ? `Register as ${roleLabel} for Campus Nexus.` : `Sign in to continue as ${roleLabel}.`}
            </p>

            {/* Approval notice for signup */}
            {isSignUp && roleFromUrl !== 'admin' && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--border-radius)',
                padding: '10px 12px',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>⏳</span>
                <span>New accounts require approval before access is granted.</span>
              </div>
            )}

            {/* Error / Success Messages */}
            {error && (
              <div className="login-message login-error">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success animate-fade-in" style={{ marginBottom: 'var(--spacing-md)' }}>
                <span></span> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {isSignUp && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  minLength={6}
                  required
                />
              </div>

              {/* Department selector — shown during signup for student, teacher, and HOD */}
              {isSignUp && ['student', 'teacher', 'hod'].includes(roleFromUrl) && (
                <div className="form-group">
                  <label>Department</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)} required>
                    <option value="">Select Department</option>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                    <option value="BA">BA</option>
                    <option value="BCom">BCom</option>
                    <option value="BSC">BSC</option>
                  </select>
                </div>
              )}

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="login-spinner"></span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Toggle between Sign In / Sign Up */}
            {roleFromUrl !== 'admin' && (
              <div className="login-toggle">
                <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
                  className="login-toggle-btn"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            )}
            
            {roleFromUrl === 'admin' && isSignUp && (
              <div className="login-toggle">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
                  className="login-toggle-btn"
                >
                  Sign In
                </button>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default Login;
