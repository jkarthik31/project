const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Only admin, hod, teacher can access analytics
function requireStaff(req, res, next) {
  if (!['admin', 'hod', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  next();
}

// GET /api/analytics/overview
// Totals + placement rate. HOD gets dept-scoped, admin/teacher get full.
router.get('/overview', requireStaff, async (req, res) => {
  try {
    let deptFilter = '';
    const params = [];

    if (['hod', 'teacher'].includes(req.user.role)) {
      const [p] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = p[0]?.department;
      if (dept) {
        deptFilter = "AND p.department = ?";
        params.push(dept);
      }
    }

    const [[{ total_students }]] = await db.query(
      `SELECT COUNT(*) as total_students FROM profiles p WHERE role='student' ${deptFilter}`,
      params
    );

    const [[{ total_applications }]] = await db.query(
      `SELECT COUNT(*) as total_applications FROM applications a
       LEFT JOIN profiles p ON a.student_id = p.id
       WHERE 1=1 ${deptFilter}`,
      params
    );

    const [[{ total_placed }]] = await db.query(
      `SELECT COUNT(*) as total_placed FROM applications a
       LEFT JOIN profiles p ON a.student_id = p.id
       WHERE a.status IN ('selected','offer') ${deptFilter}`,
      params
    );

    const [[{ total_jobs }]] = await db.query(
      "SELECT COUNT(*) as total_jobs FROM jobs WHERE status='active'"
    );

    const [[{ highest_package }]] = await db.query(
      "SELECT MAX(CAST(REGEXP_REPLACE(package, '[^0-9.]', '') AS DECIMAL(10,2))) as highest_package FROM jobs"
    );

    const placement_rate = total_students > 0
      ? Math.round((total_placed / total_students) * 100)
      : 0;

    res.json({
      total_students,
      total_applications,
      total_placed,
      total_jobs,
      placement_rate,
      highest_package: highest_package || 0,
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/analytics/by-department
// Applications and placements grouped by student department
router.get('/by-department', requireStaff, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.department,
        COUNT(a.id)                                          AS total_applications,
        SUM(a.status IN ('selected','offer'))                AS placed,
        COUNT(DISTINCT a.student_id)                         AS unique_students
      FROM applications a
      LEFT JOIN profiles p ON a.student_id = p.id
      WHERE p.department IS NOT NULL
      GROUP BY p.department
      ORDER BY total_applications DESC
    `);
    res.json({ departments: rows });
  } catch (err) {
    console.error('Analytics by-department error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/analytics/company-trends
// Top hiring companies by number of applications
router.get('/company-trends', requireStaff, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        j.company,
        COUNT(a.id)                             AS total_applications,
        SUM(a.status IN ('selected','offer'))   AS offers_made,
        j.package
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      WHERE j.company IS NOT NULL
      GROUP BY j.company, j.package
      ORDER BY total_applications DESC
      LIMIT 10
    `);
    res.json({ companies: rows });
  } catch (err) {
    console.error('Analytics company-trends error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/analytics/status-breakdown
// Count of each application status
router.get('/status-breakdown', requireStaff, async (req, res) => {
  try {
    let deptFilter = '';
    const params = [];
    if (['hod', 'teacher'].includes(req.user.role)) {
      const [p] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = p[0]?.department;
      if (dept) {
        deptFilter = 'WHERE p.department = ?';
        params.push(dept);
      }
    }
    const [rows] = await db.query(`
      SELECT a.status, COUNT(*) as count
      FROM applications a
      LEFT JOIN profiles p ON a.student_id = p.id
      ${deptFilter}
      GROUP BY a.status
      ORDER BY FIELD(a.status,'applied','shortlisted','interview','selected','offer','rejected')
    `, params);
    res.json({ statuses: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
