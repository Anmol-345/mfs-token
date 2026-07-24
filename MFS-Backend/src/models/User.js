const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true,
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  referralCode: {
    type: DataTypes.STRING(12),
    unique: true,
    allowNull: false,
  },
  referredBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  mfsAddress: {
    type: DataTypes.STRING(42),
    unique: true,
    allowNull: true,
  },
  walletAddress: {
    type: DataTypes.STRING(42),
    unique: true,
    allowNull: true,
  },
  kycLevel: {
    type: DataTypes.ENUM('unverified', 'basic', 'advanced'),
    defaultValue: 'unverified',
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned'),
    defaultValue: 'active',
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['phone'], unique: true },
    { fields: ['referral_code'], unique: true },
    { fields: ['mfs_address'], unique: true },
    { fields: ['wallet_address'], unique: true },
  ],
});

module.exports = User;
