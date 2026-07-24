const winston = require('winston');
const { env } = require('../config/env');

const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'mfs-api' },
  transports: [
    ...(env.isDev
      ? [new winston.transports.Console({ format: winston.format.cli() })]
      : [
          new winston.transports.File({
            filename: '/var/log/mfs/error.log',
            level: 'error',
            maxsize: 10485760,
            maxFiles: 10,
          }),
          new winston.transports.File({
            filename: '/var/log/mfs/combined.log',
            maxsize: 10485760,
            maxFiles: 10,
          }),
        ]),
  ],
});

module.exports = logger;
