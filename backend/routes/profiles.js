const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware); // All profile routes require login

// GET /api/profiles/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, name, role, department, phone, avatar_url, cgpa, skills, resume_url, portfolio_url, github_url, linkedin_url, profile_completion, created_at FROM profiles WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found.' });
    res.json({ profile: rows[0] });
  } catch (err) {
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
    await db.query(
      `UPDATE profiles SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        department = COALESCE(?, department),
        cgpa = COALESCE(?, cgpa),
        skills = COALESCE(?, skills),
        avatar_url = COALESCE(?, avatar_url),
        resume_url = COALESCE(?, resume_url),
        portfolio_url = COALESCE(?, portfolio_url),
        github_url = COALESCE(?, github_url),
        linkedin_url = COALESCE(?, linkedin_url)
      WHERE id = ?`,
      [name, phone, department, cgpa, skills, avatar_url, resume_url, portfolio_url, github_url, linkedin_url, req.params.id]
    );
    const [rows] = await db.query(
      'SELECT id, email, name, role, department, phone, avatar_url, cgpa, skills, resume_url, portfolio_url, github_url, linkedin_url, profile_completion FROM profiles WHERE id = ?',
      [req.params.id]
    );
    res.json({ profile: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/profiles  (admin only - get all profiles)
router.get('/', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
  try {
    const [rows] = await db.query(
      'SELECT id, email, name, role, department, phone, cgpa, skills, resume_url, created_at FROM profiles ORDER BY created_at DESC'
    );
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

module.exports = router;
