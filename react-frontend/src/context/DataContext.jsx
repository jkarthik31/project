import React, { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const DataProvider = ({ children }) => {

  // ========================
  // JOBS
  // ========================

  const getJobs = async (status = 'active') => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching jobs:', error); return []; }
    return data;
  };

  const getJobById = async (id) => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) { console.error('Error fetching job:', error); return null; }
    return data;
  };

  const createJob = async (job) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single();

    return { data, error };
  };

  const updateJob = async (id, updates) => {
    const { data, error } = await supabase
      .from('jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  };

  // ========================
  // APPLICATIONS
  // ========================

  const getApplications = async (studentId) => {
    const query = supabase
      .from('applications')
      .select(`
        *,
        jobs:job_id (
          title,
          company,
          position,
          location,
          deadline
        )
      `)
      .order('applied_at', { ascending: false });

    if (studentId) {
      query.eq('student_id', studentId);
    }

    const { data, error } = await query;
    if (error) { console.error('Error fetching applications:', error); return []; }
    return data;
  };

  const addApplication = async (studentId, jobId) => {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        student_id: studentId,
        job_id: jobId,
        status: 'applied',
      })
      .select()
      .single();

    return { data, error };
  };

  const updateApplicationStatus = async (applicationId, status) => {
    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    return { data, error };
  };

  // ========================
  // PROFILES (read helpers)
  // ========================

  const getProfilesByRole = async (role) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching profiles:', error); return []; }
    return data;
  };

  const getProfilesByDepartment = async (department) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching department profiles:', error); return []; }
    return data;
  };

  // ========================
  // STATS (dashboard counters)
  // ========================

  const getDashboardStats = async () => {
    const [
      { count: totalStudents },
      { count: totalJobs },
      { count: totalApplications },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalStudents: totalStudents || 0,
      totalJobs: totalJobs || 0,
      totalApplications: totalApplications || 0,
    };
  };

  return (
    <DataContext.Provider value={{
      // Jobs
      getJobs,
      getJobById,
      createJob,
      updateJob,
      // Applications
      getApplications,
      addApplication,
      updateApplicationStatus,
      // Profiles
      getProfilesByRole,
      getProfilesByDepartment,
      // Stats
      getDashboardStats,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
