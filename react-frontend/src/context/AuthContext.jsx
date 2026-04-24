import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API = 'http://localhost:5000/api';
const TOKEN_KEY = 'cnp_token';
const PROFILE_KEY = 'cnp_profile';

const saveLocal = (token, profile) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (_) {}
};

const clearLocal = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  } catch (_) {}
};

const loadLocal = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    return { token, profile };
  } catch (_) {
    return { token: null, profile: null };
  }
};

export const AuthProvider = ({ children }) => {
  const cached = loadLocal();
  const [token, setToken]     = useState(cached.token);
  const [profile, setProfile] = useState(cached.profile);
  const [loading, setLoading] = useState(!!cached.token); // only load if token exists

  // On mount: verify existing token is still valid
  useEffect(() => {
    if (!cached.token) {
      setLoading(false);
      return;
    }

    // Verify token against server
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${cached.token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile);
          saveLocal(cached.token, data.profile);
        } else {
          // Token expired or invalid
          clearLocal();
          setToken(null);
          setProfile(null);
        }
      })
      .catch(() => {
        // Server unreachable but token exists — keep cached profile so app doesn't break
        console.warn('Server unreachable, using cached profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email, password, name, role = 'student', department = null) => {
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, department }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error } };

      saveLocal(data.token, data.profile);
      setToken(data.token);
      setProfile(data.profile);
      return { data, error: null };
    } catch (err) {
      return { error: { message: 'Cannot connect to server. Is the backend running?' } };
    }
  };

  const signIn = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error } };

      saveLocal(data.token, data.profile);
      setToken(data.token);
      setProfile(data.profile);
      return { data, error: null };
    } catch (err) {
      return { error: { message: 'Cannot connect to server. Make sure the backend is running on port 5000.' } };
    }
  };

  const signOut = () => {
    clearLocal();
    setToken(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!token || !profile) return { error: { message: 'Not authenticated' } };
    try {
      const res = await fetch(`${API}/profiles/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error } };

      saveLocal(token, data.profile);
      setProfile(data.profile);
      return { data: data.profile, error: null };
    } catch (err) {
      return { error: { message: 'Server error.' } };
    }
  };

  const isLoggedIn = !!token && !!profile;
  const isStudent  = profile?.role === 'student';
  const isTeacher  = profile?.role === 'teacher';
  const isHOD      = profile?.role === 'hod';
  const isAdmin    = profile?.role === 'admin';
  const user       = profile ? { id: profile.id } : null;
  const currentUser = profile;

  return (
    <AuthContext.Provider value={{
      token,
      user,
      profile,
      loading,
      currentUser,
      isLoggedIn,
      isStudent,
      isTeacher,
      isHOD,
      isAdmin,
      signUp,
      signIn,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
