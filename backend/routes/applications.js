const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/applications?student_id=xxx  (student's own) or all (admin/hod/teacher)
router.get('/', async (req, res) => {
  try {
    const { student_id } = req.query;

    if (student_id) {
      // Students can only see their own; others can see anyone's
      if (req.user.role === 'student' && req.user.id !== student_id) {
        return res.status(403).json({ error: 'Forbidden.' });
      }
      const [rows] = await db.query(
        `SELECT a.*, j.title as job_title, j.company, j.position, j.location, j.deadline
         FROM applications a
         LEFT JOIN jobs j ON a.job_id = j.id
         WHERE a.student_id = ?
         ORDER BY a.applied_at DESC`,
        [student_id]
      );
      return res.json({ applications: rows });
    }

    // Only admins/hod/teacher can view all
    if (!['admin', 'hod', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const [rows] = await db.query(
      `SELECT a.*, j.title as job_title, j.company, p.name as student_name, p.email as student_email
       FROM applications a
       LEFT JOIN jobs j ON a.job_id = j.id
       LEFT JOIN profiles p ON a.student_id = p.id
       ORDER BY a.applied_at DESC`
    );
    res.json({ applications: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/applications  (student applies to a job)
router.post('/', async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can apply.' });
  }

  const { job_id } = req.body;
  if (!job_id) return res.status(400).json({ error: 'job_id is required.' });

  try {
    const [jobs] = await db.query('SELECT min_cgpa, allowed_departments FROM jobs WHERE id = ?', [job_id]);
    if (jobs.length === 0) return res.status(404).json({ error: 'Job not found.' });
    const job = jobs[0];

    const [profiles] = await db.query('SELECT cgpa, department FROM profiles WHERE id = ?', [req.user.id]);
    const student = profiles[0] || {};
    const studentCgpa = parseFloat(student.cgpa) || 0;
    const studentDept = student.department || '';

    if (job.min_cgpa && studentCgpa < parseFloat(job.min_cgpa)) {
      return res.status(403).json({ error: `You do not meet the minimum CGPA requirement of ${job.min_cgpa}.` });
    }
    if (job.allowed_departments && job.allowed_departments.trim() !== '') {
      const depts = job.allowed_departments.split(',').map(d => d.trim().toLowerCase());
      if (!depts.includes(studentDept.toLowerCase())) {
        return res.status(403).json({ error: `This job is only open to the following departments: ${job.allowed_departments}.` });
      }
    }

    const [result] = await db.query(
      'INSERT INTO applications (student_id, job_id) VALUES (?, ?)',
      [req.user.id, job_id]
    );
    const [rows] = await db.query(
      `SELECT a.*, j.title as job_title, j.company, j.position
       FROM applications a LEFT JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ application: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already applied to this job.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/applications/:id/status  (admin/hod/teacher update status)
router.patch('/:id/status', async (req, res) => {
  if (!['admin', 'hod', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const { status } = req.body;
  const validStatuses = ['applied', 'shortlisted', 'selected', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
