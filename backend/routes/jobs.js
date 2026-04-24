const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/jobs  (all jobs, optional ?status=active)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM jobs';
    const params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [jobs] = await db.query(query, params);

    // If student, calculate eligibility
    if (req.user.role === 'student') {
      const [profiles] = await db.query('SELECT cgpa, department FROM profiles WHERE id = ?', [req.user.id]);
      const student = profiles[0] || {};
      const studentCgpa = parseFloat(student.cgpa) || 0;
      const studentDept = student.department || '';

      const jobsWithEligibility = jobs.map(job => {
        let isEligible = true;
        let reasons = [];

        if (job.min_cgpa && studentCgpa < parseFloat(job.min_cgpa)) {
          isEligible = false;
          reasons.push(`Requires minimum CGPA of ${job.min_cgpa}`);
        }
        
        if (job.allowed_departments && job.allowed_departments.trim() !== '') {
          const depts = job.allowed_departments.split(',').map(d => d.trim().toLowerCase());
          if (!depts.includes(studentDept.toLowerCase())) {
            isEligible = false;
            reasons.push(`Only open to: ${job.allowed_departments}`);
          }
        }
        
        return { ...job, is_eligible: isEligible, ineligibility_reasons: reasons };
      });
      return res.json({ jobs: jobsWithEligibility });
    }

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Job not found.' });
    res.json({ job: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/jobs  (admin/hod only)
router.post('/', async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only admin or HOD can post jobs.' });
  }

  const { title, company, position, description, location, package: pkg, requirements, min_cgpa = 0.00, allowed_departments = '', allowed_batches = '', deadline, status = 'active' } = req.body;

  if (!title || !company || !position) {
    return res.status(400).json({ error: 'Title, company, and position are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO jobs (title, company, position, description, location, package, requirements, min_cgpa, allowed_departments, allowed_batches, deadline, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, position, description, location, pkg, requirements, min_cgpa, allowed_departments, allowed_batches, deadline, status, req.user.id]
    );
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [result.insertId]);
    res.status(201).json({ job: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/jobs/:id
router.put('/:id', async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  const { title, company, position, description, location, package: pkg, requirements, min_cgpa, allowed_departments, allowed_batches, deadline, status } = req.body;
  try {
    await db.query(
      `UPDATE jobs SET
        title = COALESCE(?, title),
        company = COALESCE(?, company),
        position = COALESCE(?, position),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        package = COALESCE(?, package),
        requirements = COALESCE(?, requirements),
        min_cgpa = COALESCE(?, min_cgpa),
        allowed_departments = COALESCE(?, allowed_departments),
        allowed_batches = COALESCE(?, allowed_batches),
        deadline = COALESCE(?, deadline),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [title, company, position, description, location, pkg, requirements, min_cgpa, allowed_departments, allowed_batches, deadline, status, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ job: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  try {
    await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/jobs/:id/save (student saves a job)
router.post('/:id/save', async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can save jobs.' });
  try {
    await db.query('INSERT IGNORE INTO saved_jobs (student_id, job_id) VALUES (?, ?)', [req.user.id, req.params.id]);
    res.json({ message: 'Job saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/jobs/:id/save
router.delete('/:id/save', async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can unsave jobs.' });
  try {
    await db.query('DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?', [req.user.id, req.params.id]);
    res.json({ message: 'Job unsaved.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/jobs/saved/list (get saved jobs for student)
router.get('/saved/list', async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden.' });
  try {
    const [rows] = await db.query(
      `SELECT j.* FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       WHERE sj.student_id = ?
       ORDER BY sj.saved_at DESC`,
      [req.user.id]
    );
    res.json({ saved_jobs: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
