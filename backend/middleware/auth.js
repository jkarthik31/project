const jwt = require('jsonwebtoken');
const db = require('../db');

// Routes that pending users are allowed to access
const PENDING_ALLOWED_PATHS = [
  '/api/auth/me',
  '/api/auth/logout',
];

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }

    // Look up current approval_status from database
    const [rows] = await db.query(
      'SELECT approval_status, role FROM profiles WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const { approval_status, role } = rows[0];
    req.user.approval_status = approval_status;
    req.user.role = role; // use latest role from DB

    // Block pending/rejected users from accessing protected routes
    if (approval_status !== 'approved') {
      const requestPath = req.baseUrl + req.path;
      const isAllowed = PENDING_ALLOWED_PATHS.some(p => requestPath.startsWith(p));

      if (!isAllowed) {
        return res.status(403).json({
          error: approval_status === 'rejected'
            ? 'Your account has been rejected.'
            : 'Your account is awaiting approval.',
          approval_status,
        });
      }
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
