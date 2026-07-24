const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  referrerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  referredId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  rewardEarned: {
    type: DataTypes.DECIMAL(32, 8),
    defaultValue: 0,
  },
}, {
  tableName: 'referrals',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['referrer_id'] },
    { fields: ['referred_id'], unique: true },
    { fields: ['level'] },
  ],
});

module.exports = Referral;
