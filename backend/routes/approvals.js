const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const router = express.Router();
router.use(authMiddleware);

// Helper: send in-app notification
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

// ────────────────────────────────────────────────────────────
// GET /api/approvals/stats — counters for dashboard
// ────────────────────────────────────────────────────────────
router.get('/stats', requireRole('admin', 'hod'), async (req, res) => {
  try {
    let pendingStudents = 0, pendingHods = 0, totalApproved = 0, totalRejected = 0;

    if (req.user.role === 'admin') {
      const [[s]] = await db.query("SELECT COUNT(*) AS c FROM profiles WHERE role = 'student' AND approval_status = 'pending'");
      const [[h]] = await db.query("SELECT COUNT(*) AS c FROM profiles WHERE role = 'hod' AND approval_status = 'pending'");
      const [[a]] = await db.query("SELECT COUNT(*) AS c FROM profiles WHERE approval_status = 'approved'");
      const [[r]] = await db.query("SELECT COUNT(*) AS c FROM profiles WHERE approval_status = 'rejected'");
      pendingStudents = s.c;
      pendingHods = h.c;
      totalApproved = a.c;
      totalRejected = r.c;
    } else {
      // HOD: only their department's students
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = userRow[0]?.department;
      if (dept) {
        const [[s]] = await db.query(
          "SELECT COUNT(*) AS c FROM profiles WHERE role = 'student' AND department = ? AND approval_status = 'pending'",
          [dept]
        );
        pendingStudents = s.c;
      }
    }

    res.json({ pendingStudents, pendingHods, totalApproved, totalRejected });
  } catch (err) {
    console.error('Approval stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/approvals/pending — list pending users
// ────────────────────────────────────────────────────────────
router.get('/pending', requireRole('admin', 'hod'), async (req, res) => {
  try {
    const { search, role: filterRole, department: filterDept } = req.query;
    let query = '';
    let params = [];

    if (req.user.role === 'admin') {
      query = `SELECT id, email, name, role, department, created_at
               FROM profiles
               WHERE approval_status = 'pending' AND role != 'admin'`;
      if (filterRole) {
        query += ' AND role = ?';
        params.push(filterRole);
      }
      if (filterDept) {
        query += ' AND department = ?';
        params.push(filterDept);
      }
    } else {
      // HOD: only pending students in their department
      const [userRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      const dept = userRow[0]?.department;
      query = `SELECT id, email, name, role, department, created_at
               FROM profiles
               WHERE approval_status = 'pending' AND role = 'student' AND department = ?`;
      params.push(dept);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at ASC';

    const [rows] = await db.query(query, params);
    res.json({ pending: rows });
  } catch (err) {
    console.error('Pending list error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/approvals/history — audit log
// ────────────────────────────────────────────────────────────
router.get('/history', requireRole('admin', 'hod'), async (req, res) => {
  try {
    let query = '';
    let params = [];

    if (req.user.role === 'admin') {
      query = `SELECT a.id, a.action, a.reason, a.created_at,
                      t.name AS target_name, t.email AS target_email, t.role AS target_role, t.department AS target_department,
                      p.name AS performer_name
               FROM approval_audit_log a
               JOIN profiles t ON a.target_user_id = t.id
               JOIN profiles p ON a.performed_by = p.id
               ORDER BY a.created_at DESC
               LIMIT 100`;
    } else {
      // HOD: only their actions
      query = `SELECT a.id, a.action, a.reason, a.created_at,
                      t.name AS target_name, t.email AS target_email, t.role AS target_role, t.department AS target_department,
                      p.name AS performer_name
               FROM approval_audit_log a
               JOIN profiles t ON a.target_user_id = t.id
               JOIN profiles p ON a.performed_by = p.id
               WHERE a.performed_by = ?
               ORDER BY a.created_at DESC
               LIMIT 50`;
      params.push(req.user.id);
    }

    const [rows] = await db.query(query, params);
    res.json({ history: rows });
  } catch (err) {
    console.error('Approval history error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────────────
// PATCH /api/approvals/:userId/approve
// ────────────────────────────────────────────────────────────
router.patch('/:userId/approve', requireRole('admin', 'hod'), async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch target user
    const [rows] = await db.query(
      'SELECT id, name, email, role, department, approval_status FROM profiles WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    const target = rows[0];

    // Prevent duplicate approval
    if (target.approval_status === 'approved') {
      return res.status(409).json({ error: 'User is already approved.' });
    }

    // Authorization checks
    if (target.role === 'hod' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only Admin can approve HOD accounts.' });
    }

    if (target.role === 'student' && req.user.role === 'hod') {
      // HOD can only approve students in their department
      const [hodRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      if (hodRow[0]?.department !== target.department) {
        return res.status(403).json({ error: 'You can only approve students in your department.' });
      }
    }

    // Approve the user
    await db.query(
      `UPDATE profiles SET approval_status = 'approved', approved_by = ?, approved_at = NOW(), is_first_login = FALSE
       WHERE id = ?`,
      [req.user.id, userId]
    );

    // Write audit log
    await db.query(
      `INSERT INTO approval_audit_log (target_user_id, action, performed_by) VALUES (?, 'approved', ?)`,
      [userId, req.user.id]
    );

    // Notify the user
    await notify(userId, 'approval_granted', 'Account Approved! 🎉',
      'Your account has been approved. You now have full access to Campus Nexus.',
      target.role === 'hod' ? '/hod' : '/dashboard');

    res.json({ message: `${target.name} has been approved.` });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────────────
// PATCH /api/approvals/:userId/reject
// ────────────────────────────────────────────────────────────
router.patch('/:userId/reject', requireRole('admin', 'hod'), async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, department, approval_status FROM profiles WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    const target = rows[0];

    if (target.approval_status === 'rejected') {
      return res.status(409).json({ error: 'User is already rejected.' });
    }

    // Authorization checks
    if (target.role === 'hod' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only Admin can reject HOD accounts.' });
    }

    if (target.role === 'student' && req.user.role === 'hod') {
      const [hodRow] = await db.query('SELECT department FROM profiles WHERE id = ?', [req.user.id]);
      if (hodRow[0]?.department !== target.department) {
        return res.status(403).json({ error: 'You can only reject students in your department.' });
      }
    }

    // Reject the user
    await db.query(
      `UPDATE profiles SET approval_status = 'rejected', rejection_reason = ?, approved_by = ?, approved_at = NOW()
       WHERE id = ?`,
      [reason || null, req.user.id, userId]
    );

    // Audit log
    await db.query(
      `INSERT INTO approval_audit_log (target_user_id, action, performed_by, reason) VALUES (?, 'rejected', ?, ?)`,
      [userId, req.user.id, reason || null]
    );

    // Notify the user
    await notify(userId, 'approval_rejected', 'Account Not Approved',
      reason ? `Your account was not approved. Reason: ${reason}` : 'Your account was not approved. Please contact the administration.',
      null);

    res.json({ message: `${target.name} has been rejected.` });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/approvals/settings — auto-approve toggle (admin)
// ────────────────────────────────────────────────────────────
router.get('/settings', requireRole('admin'), async (req, res) => {
  // For simplicity, store auto-approve as a row in a key-value style
  // We'll use a simple approach: check if a settings table exists, else return defaults
  try {
    const [rows] = await db.query(
      "SELECT * FROM approval_settings LIMIT 1"
    ).catch(() => [[]]); // table may not exist yet

    if (rows && rows.length > 0) {
      res.json({ auto_approve_students: !!rows[0].auto_approve_students, auto_approve_hods: !!rows[0].auto_approve_hods });
    } else {
      res.json({ auto_approve_students: false, auto_approve_hods: false });
    }
  } catch {
    res.json({ auto_approve_students: false, auto_approve_hods: false });
  }
});

// PATCH /api/approvals/settings
router.patch('/settings', requireRole('admin'), async (req, res) => {
  const { auto_approve_students, auto_approve_hods } = req.body;
  try {
    // Create table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS approval_settings (
        id INT PRIMARY KEY DEFAULT 1,
        auto_approve_students BOOLEAN NOT NULL DEFAULT FALSE,
        auto_approve_hods BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      INSERT INTO approval_settings (id, auto_approve_students, auto_approve_hods)
      VALUES (1, ?, ?)
      ON DUPLICATE KEY UPDATE auto_approve_students = VALUES(auto_approve_students), auto_approve_hods = VALUES(auto_approve_hods)
    `, [!!auto_approve_students, !!auto_approve_hods]);

    res.json({ message: 'Settings updated.', auto_approve_students: !!auto_approve_students, auto_approve_hods: !!auto_approve_hods });
  } catch (err) {
    console.error('Settings error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
