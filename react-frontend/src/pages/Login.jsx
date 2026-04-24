import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import './Home.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, isLoggedIn, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'student';

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
        const { error: signUpError } = await signUp(email, password, name, roleFromUrl, department || null);
        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
        } else {
          setSuccess('Account created! Check your email to confirm, then log in.');
          setIsSignUp(false);
          setPassword('');
          setIsLoading(false);
        }
      } else {
        // Sign In
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
          setIsLoading(false);
        }
        // If successful, we don't set loading false. 
        // We wait for the AuthContext to update and the useEffect below to redirect.
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Auto-redirect once logged in and profile is loaded
  React.useEffect(() => {
    if (isLoggedIn && profile) {
      switch (profile.role) {
        case 'admin': navigate('/admin'); break;
        case 'hod': navigate('/hod'); break;
        case 'teacher': navigate('/teacher'); break;
        default: navigate('/dashboard');
      }
    }
  }, [isLoggedIn, profile, navigate]);


  return (
    <>
      <section className="hero">
        <div className="video-container">
          <video autoPlay muted loop>
            <source src="/assets/images/Cinematic_College_Placement_Video_Generation.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-content" style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>
          
          {/* Left side text content - optional, or just center the login box. Let's just center the login box for now. */}
          <div className="login-card glass-card" style={{ zIndex: 10, position: 'relative', width: '100%', maxWidth: '440px', background: 'var(--navbar-bg)', backdropFilter: 'blur(16px)', marginTop: '60px' }}>
            {/* Role Badge */}
            <div className="login-role-badge">
              {roleFromUrl === 'admin' ? 'A' : roleFromUrl === 'hod' ? 'H' : roleFromUrl === 'teacher' ? 'T' : 'S'}
            </div>

            <h2 className="login-title">
              {isSignUp ? 'Create Account' : `${roleFromUrl.charAt(0).toUpperCase() + roleFromUrl.slice(1)} Login`}
            </h2>
            <p className="login-subtitle">
              {isSignUp ? 'Join Campus Nexus Placement Portal' : 'Sign in to your account'}
            </p>

            {/* Error / Success Messages */}
            {error && (
              <div className="login-message login-error">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success animate-fade-in" style={{ marginTop: 'var(--spacing-md)' }}>
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

              {isSignUp && (roleFromUrl === 'teacher' || roleFromUrl === 'hod') && (
                <div className="form-group">
                  <label>Department</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)} required>
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Information Technology">Information Technology</option>
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
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
