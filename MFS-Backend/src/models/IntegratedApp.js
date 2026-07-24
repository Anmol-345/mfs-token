const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const IntegratedApp = sequelize.define('IntegratedApp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  appName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  apiKey: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: false,
  },
  webhookUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: ['read'],
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'integrated_apps',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['api_key'], unique: true },
  ],
});

module.exports = IntegratedApp;
