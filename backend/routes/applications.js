const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Helper: insert a notification for a user
async function notify(userId, type, title, message, link = null) {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
      [userId, type, title, message, link]
    );
  } catch (e) {
    console.error('Notification insert failed:', e.message);
  }
}

// GET /api/applications
router.get('/', async (req, res) => {
  try {
    const { student_id } = req.query;

    if (student_id) {
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

    if (!['admin', 'hod', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    // Department scoping for HOD and teacher
    let deptFilter = '';
    const deptParams = [];
    if (['hod', 'teacher'].includes(req.user.role)) {
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = userRow[0]?.department;
      if (dept) {
        deptFilter = 'AND p.department = ?';
        deptParams.push(dept);
      }
    }

    const [rows] = await db.query(
      `SELECT a.*, j.title as job_title, j.company, j.position, j.location, j.deadline,
              p.name as student_name, p.email as student_email, p.department as student_department
       FROM applications a
       LEFT JOIN jobs j ON a.job_id = j.id
       LEFT JOIN profiles p ON a.student_id = p.id
       WHERE 1=1 ${deptFilter}
       ORDER BY a.applied_at DESC`,
      deptParams
    );
    res.json({ applications: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/applications — student applies to a job
router.post('/', async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can apply.' });
  }

  const { job_id } = req.body;
  if (!job_id) return res.status(400).json({ error: 'job_id is required.' });

  try {
    const [jobs] = await db.query(
      'SELECT min_cgpa, allowed_departments, title, company FROM jobs WHERE id = ?',
      [job_id]
    );
    if (jobs.length === 0) return res.status(404).json({ error: 'Job not found.' });
    const job = jobs[0];

    const [profiles] = await db.query(
      'SELECT cgpa, department, name, resume_status, eligibility_status FROM profiles WHERE id = ?',
      [req.user.id]
    );
    const student = profiles[0] || {};
    const studentCgpa = parseFloat(student.cgpa) || 0;
    const studentDept = student.department || '';
    const studentResumeStatus = (student.resume_status || 'Pending').toLowerCase().trim();
    const studentEligibilityStatus = (student.eligibility_status || 'Training Pending').toLowerCase().trim();

    // Global Eligibility Checks
    if (studentResumeStatus !== 'approved') {
      return res.status(403).json({ error: `Your resume must be approved by a teacher before you can apply. Current Status: ${student.resume_status || 'Pending'}` });
    }
    if (studentEligibilityStatus !== 'eligible for placement') {
      return res.status(403).json({ error: `You are not currently marked as eligible for placement. Current Status: ${student.eligibility_status || 'Training Pending'}` });
    }

    // Job-specific Eligibility Checks
    if (job.min_cgpa && studentCgpa < parseFloat(job.min_cgpa)) {
      return res.status(403).json({ error: `Minimum CGPA required: ${job.min_cgpa}` });
    }
    if (job.allowed_departments && job.allowed_departments.trim() !== '') {
      const depts = job.allowed_departments.split(',').map(d => d.trim().toLowerCase());
      if (!depts.includes(studentDept.toLowerCase())) {
        return res.status(403).json({ error: `This job is only open to: ${job.allowed_departments}` });
      }
    }

    const [result] = await db.query(
      'INSERT INTO applications (student_id, job_id) VALUES (?, ?)',
      [req.user.id, job_id]
    );
    const newAppId = result.insertId;

    // Insert initial history record
    await db.query(
      'INSERT INTO application_status_history (application_id, status, changed_by) VALUES (?, ?, ?)',
      [newAppId, 'applied', req.user.id]
    );

    const [rows] = await db.query(
      `SELECT a.*, j.title as job_title, j.company, j.position
       FROM applications a LEFT JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [newAppId]
    );
    res.status(201).json({ application: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already applied to this job.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/applications/:id/history — get status history for a single application
router.get('/:id/history', async (req, res) => {
  try {
    // Allow student who owns it, or staff
    const [apps] = await db.query(
      'SELECT student_id FROM applications WHERE id = ?',
      [req.params.id]
    );
    if (!apps.length) return res.status(404).json({ error: 'Application not found.' });

    const app = apps[0];
    if (req.user.role === 'student' && req.user.id !== app.student_id) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const [rows] = await db.query(
      `SELECT h.*, p.name as changed_by_name
       FROM application_status_history h
       LEFT JOIN profiles p ON h.changed_by = p.id
       WHERE h.application_id = ?
       ORDER BY h.changed_at ASC`,
      [req.params.id]
    );
    res.json({ history: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/applications/:id/status — update status (admin/hod only)
router.patch('/:id/status', async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only HODs and Admins can update application status.' });
  }

  const { status, notes } = req.body;
  const validStatuses = ['applied', 'shortlisted', 'interview', 'selected', 'offer', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    // Get application info for notification + department check
    const [apps] = await db.query(
      `SELECT a.student_id, j.title as job_title, j.company, p.department as student_department
       FROM applications a LEFT JOIN jobs j ON a.job_id = j.id
       LEFT JOIN profiles p ON a.student_id = p.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!apps.length) return res.status(404).json({ error: 'Application not found.' });
    const app = apps[0];

    // Department check for HOD/teacher — can only manage own department's students
    if (['hod', 'teacher'].includes(req.user.role)) {
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const userDept = userRow[0]?.department;
      if (userDept && app.student_department && userDept !== app.student_department) {
        return res.status(403).json({ error: 'You can only manage students in your department.' });
      }
    }

    // Update status
    await db.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    // Record in history
    await db.query(
      'INSERT INTO application_status_history (application_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
      [req.params.id, status, req.user.id, notes || null]
    );

    // Notify student
    const statusLabel = {
      shortlisted: 'Shortlisted',
      interview: 'Interview Scheduled',
      selected: '🎉 Selected',
      offer: '🎉 Offer Received',
      rejected: 'Not Selected',
    };
    if (statusLabel[status]) {
      await notify(
        app.student_id,
        'status_update',
        `${statusLabel[status]} — ${app.company}`,
        `Your application for ${app.job_title} at ${app.company} has been updated to: ${status}.`,
        '/dashboard'
      );
    }

    res.json({ message: 'Status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
