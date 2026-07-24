const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OtpLog = sequelize.define('OtpLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  channel: {
    type: DataTypes.ENUM('email', 'sms', 'whatsapp'),
    allowNull: false,
  },
  recipient: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.ENUM('register', 'login', 'verify', 'reset_password'),
    allowNull: false,
  },
  otpHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'otp_logs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['recipient'] },
    { fields: ['purpose'] },
    { fields: ['expires_at'] },
  ],
});

module.exports = OtpLog;
