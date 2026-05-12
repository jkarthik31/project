import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

const API = 'http://localhost:5000/api';

const apiFetch = async (path, token, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
};

export const DataProvider = ({ children }) => {
  const { token } = useAuth();

  // ========================
  // JOBS
  // ========================
  const getJobs = async (status) => {
    try {
      const url = status ? `/jobs?status=${status}` : '/jobs';
      const data = await apiFetch(url, token);
      return data.jobs || [];
    } catch (err) { console.error(err); return []; }
  };

  const getJobById = async (id) => {
    try {
      const data = await apiFetch(`/jobs/${id}`, token);
      return data.job;
    } catch (err) { console.error(err); return null; }
  };

  const createJob = async (jobData) => {
    try {
      const data = await apiFetch('/jobs', token, {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
      return { data: data.job, error: null };
    } catch (err) { return { data: null, error: { message: err.message } }; }
  };

  const updateJob = async (id, jobData) => {
    try {
      const data = await apiFetch(`/jobs/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });
      return { data: data.job, error: null };
    } catch (err) { return { data: null, error: { message: err.message } }; }
  };

  const deleteJob = async (id) => {
    try {
      await apiFetch(`/jobs/${id}`, token, { method: 'DELETE' });
      return { error: null };
    } catch (err) { return { error: { message: err.message } }; }
  };

  // ========================
  // SAVED JOBS
  // ========================
  const getSavedJobs = async () => {
    try {
      const data = await apiFetch('/jobs/saved/list', token);
      return data.saved_jobs || [];
    } catch (err) { console.error(err); return []; }
  };

  const saveJob = async (jobId) => {
    try {
      await apiFetch(`/jobs/${jobId}/save`, token, { method: 'POST' });
      return { error: null };
    } catch (err) { return { error: { message: err.message } }; }
  };

  const unsaveJob = async (jobId) => {
    try {
      await apiFetch(`/jobs/${jobId}/save`, token, { method: 'DELETE' });
      return { error: null };
    } catch (err) { return { error: { message: err.message } }; }
  };

  // ========================
  // APPLICATIONS
  // ========================
  const getApplications = async (studentId) => {
    try {
      const url = studentId ? `/applications?student_id=${studentId}` : '/applications';
      const data = await apiFetch(url, token);
      return (data.applications || []).map(a => ({
        ...a,
        jobs: { company: a.company, position: a.position, title: a.job_title, location: a.location, deadline: a.deadline },
      }));
    } catch (err) { console.error(err); return []; }
  };

  const getApplicationHistory = async (appId) => {
    try {
      const data = await apiFetch(`/applications/${appId}/history`, token);
      return data.history || [];
    } catch (err) { console.error(err); return []; }
  };

  const addApplication = async (studentId, jobId) => {
    try {
      const data = await apiFetch('/applications', token, {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId }),
      });
      return { data: data.application, error: null };
    } catch (err) { return { data: null, error: { message: err.message } }; }
  };

  const updateApplicationStatus = async (appId, status, notes = '') => {
    try {
      await apiFetch(`/applications/${appId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes })
      });
      return { error: null };
    } catch (err) { return { error: { message: err.message } }; }
  };

  // ========================
  // PROFILES (admin)
  // ========================
  const getAllProfiles = async () => {
    try {
      const data = await apiFetch('/profiles', token);
      return data.profiles || [];
    } catch (err) { console.error(err); return []; }
  };

  const getProfilesByRole = async (role) => {
    try {
      const profiles = await getAllProfiles();
      return profiles.filter(p => p.role === role);
    } catch { return []; }
  };

  const getProfilesByDepartment = async (dept) => {
    try {
      const profiles = await getAllProfiles();
      return profiles.filter(p => p.department === dept);
    } catch { return []; }
  };

  const updateProfileRole = async (userId, newRole) => {
    try {
      await apiFetch(`/profiles/${userId}/role`, token, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      return { error: null };
    } catch (err) { return { error: { message: err.message } }; }
  };

  // ========================
  // STATS
  // ========================
  const getDashboardStats = async () => {
    try {
      const data = await apiFetch('/stats', token);
      return data;
    } catch { return { totalStudents: 0, totalJobs: 0, totalApplications: 0, pendingStudents: 0, pendingHODs: 0 }; }
  };

  // ========================
  // RECOMMENDATIONS (Feature 1)
  // ========================
  const getRecommendations = async () => {
    try {
      const data = await apiFetch('/recommendations', token);
      return data.recommendations || [];
    } catch (err) { console.error(err); return []; }
  };

  // ========================
  // NOTIFICATIONS (Feature 5)
  // ========================
  const getNotifications = async () => {
    try {
      const data = await apiFetch('/notifications', token);
      return { notifications: data.notifications || [], unread_count: data.unread_count || 0 };
    } catch (err) { console.error(err); return { notifications: [], unread_count: 0 }; }
  };

  const markNotificationRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, token, { method: 'PATCH' });
      return { error: null };
    } catch (err) { return { error: { message: err.message } }; }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', token, { method: 'PATCH' });
      return { error: null };
    } catch (err) { return { error: { message: err.message } }; }
  };

  // ========================
  // ANALYTICS (Feature 3)
  // ========================
  const getAnalyticsOverview = async () => {
    try {
      const data = await apiFetch('/analytics/overview', token);
      return data;
    } catch (err) { console.error(err); return null; }
  };

  const getAnalyticsByDepartment = async () => {
    try {
      const data = await apiFetch('/analytics/by-department', token);
      return data.departments || [];
    } catch (err) { console.error(err); return []; }
  };

  const getAnalyticsCompanyTrends = async () => {
    try {
      const data = await apiFetch('/analytics/company-trends', token);
      return data.companies || [];
    } catch (err) { console.error(err); return []; }
  };

  const getAnalyticsStatusBreakdown = async () => {
    try {
      const data = await apiFetch('/analytics/status-breakdown', token);
      return data.statuses || [];
    } catch (err) { console.error(err); return []; }
  };

  // ========================
  // APPROVALS (New)
  // ========================
  const getPendingApprovals = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.role) params.set('role', filters.role);
      if (filters.department) params.set('department', filters.department);
      const qs = params.toString();
      const data = await apiFetch(`/approvals/pending${qs ? `?${qs}` : ''}`, token);
      return data.pending || [];
    } catch (err) { console.error(err); return []; }
  };

  const getApprovalHistory = async () => {
    try {
      const data = await apiFetch('/approvals/history', token);
      return data.history || [];
    } catch (err) { console.error(err); return []; }
  };

  const getApprovalStats = async () => {
    try {
      const data = await apiFetch('/approvals/stats', token);
      return data;
    } catch (err) { console.error(err); return { pendingStudents: 0, pendingHods: 0, totalApproved: 0, totalRejected: 0 }; }
  };

  const approveUser = async (userId) => {
    try {
      const data = await apiFetch(`/approvals/${userId}/approve`, token, { method: 'PATCH' });
      return { data, error: null };
    } catch (err) { return { data: null, error: { message: err.message } }; }
  };

  const rejectUser = async (userId, reason = '') => {
    try {
      const data = await apiFetch(`/approvals/${userId}/reject`, token, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      return { data, error: null };
    } catch (err) { return { data: null, error: { message: err.message } }; }
  };

  const getApprovalSettings = async () => {
    try {
      const data = await apiFetch('/approvals/settings', token);
      return data;
    } catch { return { auto_approve_students: false, auto_approve_hods: false }; }
  };

  const updateApprovalSettings = async (settings) => {
    try {
      const data = await apiFetch('/approvals/settings', token, {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
      return { data, error: null };
    } catch (err) { return { data: null, error: { message: err.message } }; }
  };

  return (
    <DataContext.Provider value={{
      // Jobs
      getJobs, getJobById, createJob, updateJob, deleteJob,
      // Saved Jobs
      getSavedJobs, saveJob, unsaveJob,
      // Applications
      getApplications, getApplicationHistory, addApplication, updateApplicationStatus,
      // Profiles
      getProfilesByRole, getProfilesByDepartment, getAllProfiles, updateProfileRole,
      // Stats
      getDashboardStats,
      // Recommendations
      getRecommendations,
      // Notifications
      getNotifications, markNotificationRead, markAllNotificationsRead,
      // Analytics
      getAnalyticsOverview, getAnalyticsByDepartment, getAnalyticsCompanyTrends, getAnalyticsStatusBreakdown,
      // Approvals (New)
      getPendingApprovals, getApprovalHistory, getApprovalStats,
      approveUser, rejectUser,
      getApprovalSettings, updateApprovalSettings,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
