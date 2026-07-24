const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const { env } = require('../config/env');

const adminAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    if (!decoded.adminId) {
      return res.status(401).json({ error: 'Not an admin token' });
    }

    const admin = await Admin.findByPk(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }
    if (admin.isSuspended) {
      return res.status(403).json({ error: 'Admin account suspended' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.admin.role === 'SUPER_ADMIN') {
      return next(); // SUPER_ADMIN can access everything
    }
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

module.exports = { adminAuthenticate, requireRole };
