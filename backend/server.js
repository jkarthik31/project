const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/approvals', require('./routes/approvals'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Public Stats for Landing Page
app.get('/api/public-stats', async (req, res) => {
  const db = require('./db');
  try {
    const [studentsResult] = await db.query("SELECT COUNT(*) as totalStudents FROM profiles WHERE role = 'student'");
    const totalStudents = studentsResult[0]?.totalStudents || 0;

    const [jobsResult] = await db.query("SELECT COUNT(*) as totalJobs FROM jobs WHERE status = 'active'");
    const totalJobs = jobsResult[0]?.totalJobs || 0;

    const [companiesResult] = await db.query("SELECT COUNT(DISTINCT company) as totalCompanies FROM jobs");
    const totalCompanies = companiesResult[0]?.totalCompanies || 0;

    const [placedResult] = await db.query("SELECT COUNT(*) as totalPlaced FROM applications WHERE status IN ('selected', 'offer')");
    const totalPlaced = placedResult[0]?.totalPlaced || 0;

    const [deptsResult] = await db.query("SELECT COUNT(DISTINCT department) as totalDepts FROM profiles WHERE department IS NOT NULL AND department != ''");
    const totalDepts = deptsResult[0]?.totalDepts || 0;
    
    const successRate = totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0;

    res.json({
      totalStudents,
      totalCompanies,
      totalJobs,
      totalPlaced,
      totalDepts,
      successRate
    });
  } catch (err) {
    console.error('Public stats error:', err);
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
});

// Public Jobs for Landing Page
app.get('/api/public-jobs', async (req, res) => {
  const db = require('./db');
  try {
    const [jobs] = await db.query("SELECT id, title, company, package, allowed_departments, requirements as eligibility_criteria, deadline FROM jobs WHERE status = 'active' ORDER BY created_at DESC LIMIT 6");
    res.json(jobs);
  } catch (err) {
    console.error('Public jobs error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Stats route (admin/hod/teacher dashboard) — department aware
app.get('/api/stats', require('./middleware/auth'), async (req, res) => {
  const db = require('./db');
  try {
    let deptFilter = '';
    const params = [];
    
    if (['hod', 'teacher'].includes(req.user.role)) {
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = userRow[0]?.department;
      if (dept) {
        deptFilter = ' AND department = ?';
        params.push(dept);
      }
    }

    const [[{ totalStudents }]] = await db.query(`SELECT COUNT(*) as totalStudents FROM profiles WHERE role = 'student' AND approval_status = 'approved'${deptFilter}`, params);
    
    // For jobs, HODs/Teachers only see jobs allowed for their department
    let jobFilter = " WHERE status = 'active'";
    const jobParams = [];
    if (['hod', 'teacher'].includes(req.user.role)) {
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = userRow[0]?.department;
      if (dept) {
        jobFilter += " AND (allowed_departments IS NULL OR allowed_departments = '' OR FIND_IN_SET(?, REPLACE(allowed_departments, ' ', '')) > 0)";
        jobParams.push(dept);
      }
    }
    const [[{ totalJobs }]] = await db.query(`SELECT COUNT(*) as totalJobs FROM jobs${jobFilter}`, jobParams);

    // For applications, HODs/Teachers only see applications from their department's students
    let appFilter = '';
    const appParams = [];
    if (['hod', 'teacher'].includes(req.user.role)) {
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = userRow[0]?.department;
      if (dept) {
        appFilter = " JOIN profiles p ON a.student_id = p.id WHERE p.department = ?";
        appParams.push(dept);
      }
    }
    const [[{ totalApplications }]] = await db.query(`SELECT COUNT(*) as totalApplications FROM applications a${appFilter}`, appParams);

    const [[{ pendingStudents }]] = await db.query(`SELECT COUNT(*) as pendingStudents FROM profiles WHERE role = 'student' AND approval_status = 'pending'${deptFilter}`, params);
    const [[{ pendingTeachers }]] = await db.query(`SELECT COUNT(*) as pendingTeachers FROM profiles WHERE role = 'teacher' AND approval_status = 'pending'${deptFilter}`, params);
    const [[{ pendingHODs }]] = await db.query(`SELECT COUNT(*) as pendingHODs FROM profiles WHERE role = 'hod' AND approval_status = 'pending'${deptFilter}`, params);
    
    res.json({ totalStudents, totalJobs, totalApplications, pendingStudents, pendingTeachers, pendingHODs });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
