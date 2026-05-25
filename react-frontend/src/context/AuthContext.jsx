import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API = 'http://localhost:5000/api';
const TOKEN_KEY = 'cnp_token';
const PROFILE_KEY = 'cnp_profile';

const saveLocal = (token, profile) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Local storage may be unavailable in private browsing or restricted contexts.
  }
};

const clearLocal = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // Local storage may be unavailable in private browsing or restricted contexts.
  }
};

const loadLocal = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    return { token, profile };
  } catch {
    return { token: null, profile: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [cached] = useState(loadLocal);
  const [token, setToken]     = useState(cached.token);
  const [profile, setProfile] = useState(cached.profile);
  const [loading, setLoading] = useState(!!cached.token); // only load if token exists

  // Refresh profile from server (used for polling approval status)
  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        saveLocal(token, data.profile);
        return data.profile;
      }
    } catch {
      console.warn('Server unreachable during profile refresh.');
    }
    return null;
  }, [token]);

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
    } catch {
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
      if (!res.ok) {
        return {
          error: {
            message: data.error,
            approval_status: data.approval_status || null,
            rejection_reason: data.rejection_reason || null,
          },
        };
      }

      saveLocal(data.token, data.profile);
      setToken(data.token);
      setProfile(data.profile);
      return { data, error: null };
    } catch {
      return { error: { message: 'Cannot connect to server. Make sure the backend is running on port 5000.' } };
    }
  };

  const signOut = () => {
    clearLocal();
    setToken(null);
    setProfile(null);
  };

  const updateProfile = async (targetId, updates) => {
    // If targetId is not provided, use own profile id
    const id = targetId || profile?.id;
    if (!token || !id) return { error: { message: 'Not authenticated' } };
    try {
      const res = await fetch(`${API}/profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error } };

      // Only update local state if we updated our own profile
      if (id === profile?.id) {
        saveLocal(token, data.profile);
        setProfile(data.profile);
      }
      return { data: data.profile, error: null };
    } catch {
      return { error: { message: 'Server error.' } };
    }
  };

  const isLoggedIn    = !!token && !!profile;
  const isStudent     = profile?.role === 'student';
  const isTeacher     = profile?.role === 'teacher';
  const isHOD         = profile?.role === 'hod';
  const isAdmin       = profile?.role === 'admin';
  const user          = profile ? { id: profile.id } : null;
  const currentUser   = profile;

  // Approval status helpers
  const approvalStatus = profile?.approval_status || null;
  const isPending      = approvalStatus === 'pending';
  const isApproved     = approvalStatus === 'approved';
  const isRejected     = approvalStatus === 'rejected';

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
      // Approval helpers
      approvalStatus,
      isPending,
      isApproved,
      isRejected,
      // Actions
      signUp,
      signIn,
      signOut,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
