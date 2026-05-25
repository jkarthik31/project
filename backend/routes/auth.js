const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// Helper: send in-app notification to a user
const notify = async (userId, type, title, message, link = null) => {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, link]
    );
  } catch (err) {
    console.error('Notification insert error:', err.message);
  }
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name, role = 'student', department = null } = req.body;
  const validRoles = ['student', 'teacher', 'hod', 'admin'];

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid account role.' });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM profiles WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);

    // Admin accounts are auto-approved; campus roles wait for approval.
    const approval_status = role === 'admin' ? 'approved' : 'pending';

    await db.query(
      `INSERT INTO profiles (id, email, name, password_hash, role, department, approval_status, is_first_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [id, email, name, password_hash, role, department, approval_status]
    );

    const [rows] = await db.query(
      'SELECT id, email, name, role, department, approval_status FROM profiles WHERE id = ?',
      [id]
    );
    const profile = rows[0];

    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Send notifications for pending accounts
    if (approval_status === 'pending') {
      if (role === 'hod') {
        // Notify all admins
        const [admins] = await db.query("SELECT id FROM profiles WHERE role = 'admin' AND approval_status = 'approved'");
        for (const admin of admins) {
          await notify(admin.id, 'approval_request', 'New HOD Registration',
            `${name} has registered as HOD for ${department || 'unspecified'} department and is awaiting your approval.`,
            '/admin?tab=approvals');
        }
      } else if (role === 'student') {
        // Notify HOD of that department + all admins
        if (department) {
          const [hods] = await db.query(
            "SELECT id FROM profiles WHERE role = 'hod' AND department = ? AND approval_status = 'approved'",
            [department]
          );
          for (const hod of hods) {
            await notify(hod.id, 'approval_request', 'New Student Registration',
              `${name} has registered as a student in ${department} and is awaiting your approval.`,
              '/hod?tab=student-approvals');
          }
        }
        const [admins] = await db.query("SELECT id FROM profiles WHERE role = 'admin' AND approval_status = 'approved'");
        for (const admin of admins) {
          await notify(admin.id, 'approval_request', 'New Student Registration',
            `${name} has registered as a student${department ? ` in ${department}` : ''} and is awaiting approval.`,
            '/admin?tab=approvals');
        }
      } else if (role === 'teacher') {
        const [admins] = await db.query("SELECT id FROM profiles WHERE role = 'admin' AND approval_status = 'approved'");
        for (const admin of admins) {
          await notify(admin.id, 'approval_request', 'New Teacher Registration',
            `${name} has registered as a teacher${department ? ` in ${department}` : ''} and is awaiting approval.`,
            '/admin?tab=approvals');
        }
      }
    }

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

    // If account was rejected, block login
    if (profile.approval_status === 'rejected') {
      return res.status(403).json({
        error: 'Your account has been rejected.',
        rejection_reason: profile.rejection_reason || null,
        approval_status: 'rejected',
      });
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
      `SELECT id, email, name, role, department, phone, avatar_url, cgpa, skills,
              resume_url, portfolio_url, github_url, linkedin_url, profile_completion,
              approval_status, approved_by, approved_at, rejection_reason, is_first_login,
              created_at
       FROM profiles WHERE id = ?`,
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
