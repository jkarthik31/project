const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/jobs  (all jobs, optional ?status=active&department=BCA)
router.get('/', async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = 'SELECT * FROM jobs';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    // Department-based filtering
    if (req.user.role === 'student') {
      // Students only see jobs that include their department (or have no dept restriction)
      const [profiles] = await db.query('SELECT cgpa, department, skills FROM profiles WHERE id = ?', [req.user.id]);
      const student = profiles[0] || {};
      const studentDept = (student.department || '').trim();

      if (studentDept) {
        conditions.push("(allowed_departments IS NULL OR allowed_departments = '' OR FIND_IN_SET(?, REPLACE(allowed_departments, ' ', '')) > 0)");
        params.push(studentDept);
      }
    } else if (department) {
      // Explicit department filter (from query param)
      conditions.push("(allowed_departments IS NULL OR allowed_departments = '' OR FIND_IN_SET(?, REPLACE(allowed_departments, ' ', '')) > 0)");
      params.push(department);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';
    const [jobs] = await db.query(query, params);

    // If student, calculate eligibility including skills
    if (req.user.role === 'student') {
      const [profiles] = await db.query(
        'SELECT cgpa, department, skills FROM profiles WHERE id = ?',
        [req.user.id]
      );
      const student = profiles[0] || {};
      const studentCgpa = parseFloat(student.cgpa) || 0;
      const studentDept = (student.department || '').toLowerCase().trim();
      const studentSkills = (student.skills || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const jobsWithEligibility = jobs.map(job => {
        let isEligible = true;
        const reasons = [];
        const missing_skills = [];

        if (job.min_cgpa && studentCgpa < parseFloat(job.min_cgpa)) {
          isEligible = false;
          reasons.push(`Requires CGPA ≥ ${job.min_cgpa}`);
        }

        if (job.allowed_departments && job.allowed_departments.trim() !== '') {
          const depts = job.allowed_departments.split(',').map(d => d.trim().toLowerCase());
          if (!depts.includes(studentDept)) {
            isEligible = false;
            reasons.push(`Open to: ${job.allowed_departments}`);
          }
        }

        const requiredSkills = (job.required_skills || '')
          .split(',')
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);
        if (requiredSkills.length > 0) {
          const unmatched = requiredSkills.filter(s => !studentSkills.includes(s));
          if (unmatched.length > 0) {
            unmatched.forEach(s => missing_skills.push(s));
          }
        }

        return { ...job, is_eligible: isEligible, ineligibility_reasons: reasons, missing_skills };
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

  const {
    title, company, position, description, location,
    package: pkg, requirements, required_skills = '',
    min_cgpa = 0.00, allowed_departments = '',
    allowed_batches = '', deadline, status = 'active'
  } = req.body;

  if (!title || !company || !position) {
    return res.status(400).json({ error: 'Title, company, and position are required.' });
  }

  // HOD auto-tags their department if none specified
  let finalDepts = allowed_departments;
  if (req.user.role === 'hod' && (!finalDepts || finalDepts.trim() === '')) {
    const [hodProfile] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
    finalDepts = hodProfile[0]?.department || '';
  }

  try {
    const [result] = await db.query(
      `INSERT INTO jobs (title, company, position, description, location, package, requirements,
        required_skills, min_cgpa, allowed_departments, allowed_batches, deadline, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, position, description, location, pkg, requirements,
       required_skills, min_cgpa, finalDepts, allowed_batches, deadline, status, req.user.id]
    );
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [result.insertId]);
    const newJob = rows[0];

    // Notify eligible students
    if (status === 'active') {
      try {
        let studentQuery = `SELECT id FROM profiles WHERE role='student'`;
        const studentParams = [];
        if (allowed_departments && allowed_departments.trim() !== '') {
          const depts = allowed_departments.split(',').map(d => `'${d.trim()}'`).join(',');
          studentQuery += ` AND department IN (${depts})`;
        }
        if (min_cgpa && parseFloat(min_cgpa) > 0) {
          studentQuery += ` AND cgpa >= ?`;
          studentParams.push(min_cgpa);
        }
        const [eligibleStudents] = await db.query(studentQuery, studentParams);
        for (const s of eligibleStudents) {
          await db.query(
            'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
            [s.id, 'new_job', `New Job: ${title} at ${company}`,
             `A new opportunity matching your profile is now open. Deadline: ${deadline || 'TBD'}.`,
             '/jobs']
          );
        }
      } catch (notifErr) {
        console.error('Notification broadcast failed:', notifErr.message);
      }
    }

    res.status(201).json({ job: newJob });
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
