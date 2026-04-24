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
      // Normalize to match old Supabase shape (jobs nested)
      return (data.applications || []).map(a => ({
        ...a,
        jobs: { company: a.company, position: a.position, title: a.job_title, location: a.location, deadline: a.deadline },
      }));
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

  const updateApplicationStatus = async (appId, status) => {
    try {
      await apiFetch(`/applications/${appId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status })
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
    } catch (err) { return []; }
  };

  const getProfilesByDepartment = async (dept) => {
    try {
      const profiles = await getAllProfiles();
      return profiles.filter(p => p.department === dept);
    } catch (err) { return []; }
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
    } catch (err) { return { totalStudents: 0, totalJobs: 0, totalApplications: 0 }; }
  };

  return (
    <DataContext.Provider value={{
      getJobs,
      getJobById,
      createJob,
      updateJob,
      deleteJob,
      getSavedJobs,
      saveJob,
      unsaveJob,
      getApplications,
      addApplication,
      updateApplicationStatus,
      getProfilesByRole,
      getProfilesByDepartment,
      getAllProfiles,
      updateProfileRole,
      getDashboardStats,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
