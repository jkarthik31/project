const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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

// Stats route (admin dashboard) — now includes approval counters
app.get('/api/stats', require('./middleware/auth'), async (req, res) => {
  const db = require('./db');
  try {
    const [[{ totalStudents }]] = await db.query("SELECT COUNT(*) as totalStudents FROM profiles WHERE role = 'student' AND approval_status = 'approved'");
    const [[{ totalJobs }]] = await db.query("SELECT COUNT(*) as totalJobs FROM jobs WHERE status = 'active'");
    const [[{ totalApplications }]] = await db.query('SELECT COUNT(*) as totalApplications FROM applications');
    const [[{ pendingStudents }]] = await db.query("SELECT COUNT(*) as pendingStudents FROM profiles WHERE role = 'student' AND approval_status = 'pending'");
    const [[{ pendingHODs }]] = await db.query("SELECT COUNT(*) as pendingHODs FROM profiles WHERE role = 'hod' AND approval_status = 'pending'");
    res.json({ totalStudents, totalJobs, totalApplications, pendingStudents, pendingHODs });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
