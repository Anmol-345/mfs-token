const { env } = require('./env');

const config = {
  development: {
    url: env.db.url,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    url: env.db.url,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 10000,
      idle: 5000,
    },
  },
  production: {
    url: env.db.url,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 50,
      min: 10,
      acquire: 30000,
      idle: 10000,
    },
  },
};

module.exports = config;
