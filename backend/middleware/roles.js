/**
 * Role-based authorization middleware factory.
 * Usage:  router.post('/approve', requireRole('admin'), handler)
 *         router.get('/pending', requireRole('admin', 'hod'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions.' });
  }
  next();
};

module.exports = requireRole;
