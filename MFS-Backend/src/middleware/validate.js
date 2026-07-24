const logger = require('../utils/logger');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
      logger.warn('Validation failed', { path: req.path, details });
      return res.status(422).json({ error: 'Validation failed', details });
    }
    next();
  };
}

module.exports = { validate };
