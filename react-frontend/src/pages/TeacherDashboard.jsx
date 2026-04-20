import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user, profile, isLoggedIn, loading: authLoading } = useAuth();
  const { getProfilesByDepartment } = useData();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login?role=teacher');
    }
  }, [authLoading, isLoggedIn, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (user && profile?.department) {
        const deptStudents = await getProfilesByDepartment(profile.department);
        setStudents(deptStudents.filter(s => s.role === 'student'));
        setLoading(false);
      } else if (user) {
        setLoading(false);
      }
    };
    loadData();
  }, [user, profile]);

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="login-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(79,70,229,0.2)', borderTopColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Teacher Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Department: {profile.department || 'Not assigned'} · Welcome, {profile.name || profile.email}
      </p>

      {/* Stats */}
      <div className="glass-cards-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <span className="card-icon">👥</span>
          <div className="card-value">{students.length}</div>
          <div className="card-label">Dept. Students</div>
        </div>
      </div>

      {/* Department Students */}
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Your Students</h3>
        {students.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No students found in your department.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.name || '—'}</td>
                    <td style={{ padding: '0.75rem' }}>{s.email}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
