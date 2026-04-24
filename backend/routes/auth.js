const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name, role = 'student', department = null } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM profiles WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO profiles (id, email, name, password_hash, role, department)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, email, name, password_hash, role, department]
    );

    const [rows] = await db.query('SELECT id, email, name, role, department FROM profiles WHERE id = ?', [id]);
    const profile = rows[0];

    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ token, profile });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM profiles WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const profile = rows[0];
    const isMatch = await bcrypt.compare(password, profile.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password hash before sending
    const { password_hash, ...safeProfile } = profile;

    res.json({ token, profile: safeProfile });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me  (verify token & get current profile)
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, name, role, department, phone, avatar_url, cgpa, skills, resume_url, portfolio_url, github_url, linkedin_url, profile_completion, created_at FROM profiles WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found.' });
    res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
