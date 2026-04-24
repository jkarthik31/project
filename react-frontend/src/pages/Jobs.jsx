import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const { isLoggedIn, loading: authLoading, profile } = useAuth();
  const { getJobs, addApplication, getApplications } = useData();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [packageRange, setPackageRange] = useState(50);
  
  // Track applying state for individual jobs
  const [applyingTo, setApplyingTo] = useState(null);
  
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!profile) return;
    const timeout = setTimeout(() => setLoading(false), 5000);
    Promise.all([getJobs('active'), getApplications(profile.id)])
      .then(([jobsData, appsData]) => {
        setJobs(jobsData || []);
        setApplications(appsData || []);
      })
      .finally(() => { setLoading(false); clearTimeout(timeout); });
    return () => clearTimeout(timeout);
  }, [profile]);

  const handleApply = async (jobId) => {
    if (!profile) return;
    setApplyingTo(jobId);
    
    const { data, error } = await addApplication(profile.id, jobId);
    
    if (error) {
      alert(error.message || 'Failed to apply. You might have already applied.');
    } else if (data) {
      // Add the new application to state so UI updates immediately
      setApplications([...applications, data]);
    }
    
    setApplyingTo(null);
  };

  const hasApplied = (jobId) => {
    return applications.some(app => app.job_id === jobId);
  };

  const filteredJobs = jobs.filter(job => {
    // text search
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // location filter (mock matching)
    let matchesLocation = true;
    if (filterLocation !== 'All') {
      matchesLocation = job.location?.includes(filterLocation);
    }
    
    // type filter (mock matching)
    let matchesType = true;
    if (filterType !== 'All') {
      matchesType = job.type === filterType || job.position?.includes(filterType);
    }
    
    // Check package (assuming job.package is a number or parseable string like "12 LPA")
    let matchesPackage = true;
    if (job.package) {
       const packageVal = parseFloat(job.package);
       if (!isNaN(packageVal)) {
           matchesPackage = packageVal <= packageRange;
       }
    }
    
    return matchesSearch && matchesLocation && matchesType && matchesPackage;
  });

  if (authLoading && !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(79,70,229,0.2)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto', background: 'var(--bg-light)' }}>
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Browse Job Opportunities</h1>
      
      {/* Search and Filter */}
      <div className="jobs-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)', paddingBottom: 'var(--spacing-lg)', borderBottom: '2px solid rgba(0, 0, 0, 0.05)' }}>
          <div className="jobs-search" style={{ display: 'flex', gap: 'var(--spacing-md)', flex: 1, minWidth: '300px' }}>
              <input 
                type="text" 
                placeholder="Search by role, company..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
          </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr)', gap: 'var(--spacing-lg)' }} className="jobs-layout-grid">
         <style>{`
          @media (min-width: 768px) {
            .jobs-layout-grid { grid-template-columns: 250px 1fr !important; }
          }
        `}</style>
        
        {/* Sidebar */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
            <div style={{ marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--primary)', textTransform: 'uppercase', fontSize: 'var(--font-size-sm)' }}>Job Type</h4>
                {['All', 'Full-time', 'Internship', 'Contract'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', cursor: 'pointer', fontWeight: 'normal', textTransform: 'none' }}>
                    <input type="radio" name="jobType" checked={filterType === type} onChange={() => setFilterType(type)} />
                    {type}
                  </label>
                ))}
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--primary)', textTransform: 'uppercase', fontSize: 'var(--font-size-sm)' }}>Location</h4>
                {['All', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'].map(loc => (
                  <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', cursor: 'pointer', fontWeight: 'normal', textTransform: 'none' }}>
                    <input type="radio" name="location" checked={filterLocation === loc} onChange={() => setFilterLocation(loc)} />
                    {loc}
                  </label>
                ))}
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--primary)', textTransform: 'uppercase', fontSize: 'var(--font-size-sm)' }}>Package up to</h4>
                <div style={{ padding: 'var(--spacing-md)', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0.02) 100%)', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                    <input type="range" min="0" max="50" value={packageRange} onChange={e => setPackageRange(e.target.value)} style={{ width: '100%', margin: 'var(--spacing-md) 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--secondary)' }}>
                        <span>0 LPA</span>
                        <span>{packageRange} LPA</span>
                    </div>
                </div>
            </div>

            <button className="btn btn-outline btn-block" onClick={() => { setSearchTerm(''); setFilterType('All'); setFilterLocation('All'); setPackageRange(50); }}>Clear All Filters</button>
        </div>

        {/* Jobs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0.02) 100%)', border: '1px solid rgba(79, 70, 229, 0.1)', borderRadius: 'var(--border-radius-lg)' }}>
                <div style={{ fontWeight: 600, background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Showing {filteredJobs.length} jobs
                </div>
            </div>

            {filteredJobs.length === 0 ? (
               <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                  <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>🔍</div>
                  <h3 style={{ color: 'var(--text-secondary)' }}>No jobs found</h3>
                  <p>Try adjusting your search or filters.</p>
               </div>
            ) : (
              filteredJobs.map(job => {
                const applied = hasApplied(job.id);
                const isApplying = applyingTo === job.id;
                
                return (
                  <div key={job.id} className="card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                          <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--border-radius-lg)', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-white)', fontWeight: 'bold', fontSize: '20px', boxShadow: 'var(--shadow-md)' }}>
                                      {job.company?.charAt(0) || 'C'}
                                  </div>
                                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>{job.company}</span>
                              </div>
                              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: '0 0 var(--spacing-sm)', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                  {job.title}
                              </h3>
                          </div>
                          <span className="badge badge-success">OPEN</span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>Location: {job.location || 'Remote'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>Role: {job.position || 'Full-time'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
                      </div>

                      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: 1.7 }}>
                          {job.description || 'No description provided.'}
                      </p>

                      <div style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0.02) 100%)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--spacing-md)', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                          <div style={{ fontWeight: 700, marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--secondary)', textTransform: 'uppercase' }}>Requirements</div>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{job.requirements || 'Standard requirements apply.'}</p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-sm)' }}>
                              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Package:</span>
                              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--secondary)' }}>{job.package || 'Not specified'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                              <button 
                                className={`btn ${applied ? 'btn-secondary' : 'btn-primary'}`} 
                                onClick={() => handleApply(job.id)}
                                disabled={applied || isApplying}
                                style={applied ? { opacity: 0.8, cursor: 'default' } : {}}
                              >
                                {isApplying ? 'Applying...' : applied ? 'Applied' : 'Apply Now'}
                              </button>
                              <button className="btn btn-ghost">Save</button>
                          </div>
                      </div>
                  </div>
                );
              })
            )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
