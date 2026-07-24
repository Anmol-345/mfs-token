const { redis } = require('../config/redis');
const logger = require('../utils/logger');

function rateLimiter({ windowMs = 60000, max = 100, keyPrefix = 'rl' } = {}) {
  return async (req, res, next) => {
    try {
      const key = `${keyPrefix}:${req.ip || req.connection.remoteAddress}`;
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      if (current > max) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      next();
    } catch (err) {
      logger.error('Rate limiter error', { error: err.message });
      next();
    }
  };
}

module.exports = { rateLimiter };
