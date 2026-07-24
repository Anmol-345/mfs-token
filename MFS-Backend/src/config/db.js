const { Sequelize } = require('sequelize');
const { env } = require('./env');
const logger = require('../utils/logger');

const sequelize = new Sequelize(env.db.url, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  dialectOptions: {
    ssl: env.isDev ? false : {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: env.db.pool || {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
});

async function connectDb() {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected');
  } catch (err) {
    console.error('PostgreSQL connection failed:', err);
    throw err;
  }
}

module.exports = { sequelize, connectDb };
