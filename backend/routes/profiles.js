const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware); // All profile routes require login

// GET /api/profiles/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, email, name, role, department, phone, avatar_url, cgpa, skills,
              resume_url, portfolio_url, github_url, linkedin_url, profile_completion,
              approval_status, approved_by, approved_at, rejection_reason, is_first_login,
              resume_status, resume_remarks, eligibility_status, eligibility_remarks,
              created_at
       FROM profiles WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found.' });
    
    const profile = rows[0];

    // HOD/Teacher can only view students in their department
    if (['hod', 'teacher'].includes(req.user.role)) {
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const userDept = userRow[0]?.department;
      if (userDept && profile.department && userDept !== profile.department) {
        return res.status(403).json({ error: 'Access denied: User belongs to a different department.' });
      }
    }

    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/profiles/:id/verification (teacher/hod only)
router.patch('/:id/verification', async (req, res) => {
  if (!['admin', 'hod', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const { resume_status, resume_remarks, eligibility_status, eligibility_remarks } = req.body;
  console.log(`Verification update for ${req.params.id}:`, req.body);

  try {
    const [rows] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found.' });
    const targetDept = rows[0].department;

    if (['hod', 'teacher'].includes(req.user.role)) {
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const userDept = userRow[0]?.department;
      if (userDept !== targetDept) {
        return res.status(403).json({ error: 'You can only verify students in your department.' });
      }
    }

    await db.query(
      `UPDATE profiles SET
        resume_status = COALESCE(?, resume_status),
        resume_remarks = COALESCE(?, resume_remarks),
        eligibility_status = COALESCE(?, eligibility_status),
        eligibility_remarks = COALESCE(?, eligibility_remarks)
      WHERE id = ?`,
      [resume_status, resume_remarks, eligibility_status, eligibility_remarks, req.params.id]
    );

    // Notify student if anything changed
    if (resume_status || eligibility_status) {
      const type = resume_status ? 'resume_update' : 'eligibility_update';
      const title = resume_status ? 'Resume Verification Update' : 'Placement Eligibility Update';
      const status = resume_status || eligibility_status;
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, type, title, `Your ${resume_status ? 'resume' : 'eligibility'} status has been updated to: ${status}`, '/profile']
      );
    }

    res.json({ message: 'Verification updated successfully.' });
  } catch (err) {
    console.error('Verification update error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/profiles/:id  (update own profile)
router.put('/:id', async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const { name, phone, department, cgpa, skills, avatar_url, resume_url, portfolio_url, github_url, linkedin_url } = req.body;

  try {
    // If admin is updating department for HOD/Teacher
    if (req.user.role === 'admin' && department) {
      await db.query('UPDATE profiles SET department = ? WHERE id = ?', [department, req.params.id]);
    }

    await db.query(
      `UPDATE profiles SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        department = IF(?, department, department), -- Only update if admin (handled above) or if student setting initially
        cgpa = COALESCE(?, cgpa),
        skills = COALESCE(?, skills),
        avatar_url = COALESCE(?, avatar_url),
        resume_url = COALESCE(?, resume_url),
        portfolio_url = COALESCE(?, portfolio_url),
        github_url = COALESCE(?, github_url),
        linkedin_url = COALESCE(?, linkedin_url)
      WHERE id = ?`,
      [name, phone, (req.user.role === 'admin' ? null : department), cgpa, skills, avatar_url, resume_url, portfolio_url, github_url, linkedin_url, req.params.id]
    );
    const [rows] = await db.query(
      `SELECT id, email, name, role, department, phone, avatar_url, cgpa, skills,
              resume_url, portfolio_url, github_url, linkedin_url, profile_completion,
              approval_status
       FROM profiles WHERE id = ?`,
      [req.params.id]
    );
    res.json({ profile: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/profiles  (admin, hod, teacher - get profiles)
router.get('/', async (req, res) => {
  // Admin sees all profiles; HOD/Teacher sees only their department
  if (!['admin', 'hod', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  try {
    let query = `SELECT id, email, name, role, department, phone, cgpa, skills, resume_url,
                        approval_status, created_at
                 FROM profiles`;
    let params = [];

    if (['hod', 'teacher'].includes(req.user.role)) {
      // HOD/Teacher only sees their department members
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = userRow[0]?.department;
      query += ` WHERE department = ?`;
      params.push(dept);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json({ profiles: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/profiles/:id/role  (admin only - change role)
router.patch('/:id/role', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

  const { role } = req.body;
  const validRoles = ['student', 'teacher', 'hod', 'admin'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role.' });

  try {
    await db.query('UPDATE profiles SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'Role updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/profiles/:id  (admin only)
router.delete('/:id', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

  try {
    await db.query('DELETE FROM profiles WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
