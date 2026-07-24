const { verifyAccessToken } = require('../services/jwtService');
const logger = require('../utils/logger');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('JWT auth failed', { error: err.message });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
