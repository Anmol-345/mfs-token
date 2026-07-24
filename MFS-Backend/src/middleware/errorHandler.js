const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || (err.code >= 400 && err.code < 600 ? err.code : 500);
  const message = statusCode === 500 && !err.reason ? 'Internal server error' : (err.reason || err.message);
  if (statusCode === 500) {
    console.error(err.stack);
    logger.error('Unhandled error', { error: err.message, path: req.path });
  }
  // TEMPORARY: Return actual error message for debugging live server issues
  res.status(statusCode).json({ error: message, debug: err.message, stack: err.stack });
}

module.exports = { errorHandler };
