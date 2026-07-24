const Redis = require('ioredis');
const { env } = require('./env');
const logger = require('../utils/logger');

const redis = new Redis(env.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 200, 3000);
  },
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { error: err.message }));

module.exports = { redis };
