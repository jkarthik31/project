import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();
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
        } else {
          setSuccess('Account created! Check your email to confirm, then log in.');
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        // Sign In
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
        } else {
          // Navigate based on role - profile will be fetched by AuthContext
          // Small delay to let profile load
          setTimeout(() => {
            switch (roleFromUrl) {
              case 'admin': navigate('/admin'); break;
              case 'hod': navigate('/hod'); break;
              case 'teacher': navigate('/teacher'); break;
              default: navigate('/dashboard');
            }
          }, 500);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        {/* Role Badge */}
        <div className="login-role-badge">
          {roleFromUrl === 'admin' ? '🛡️' : roleFromUrl === 'hod' ? '🎓' : roleFromUrl === 'teacher' ? '📚' : '👤'}
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
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="login-message login-success">
            <span>✅</span> {success}
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
  );
};

export default Login;
