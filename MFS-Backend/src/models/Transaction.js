const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
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
  type: {
    type: DataTypes.ENUM('send', 'receive', 'accumulate', 'fee', 'genesis'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
    defaultValue: 'pending',
  },
  amount: {
    type: DataTypes.DECIMAL(32, 8),
    allowNull: false,
  },
  fee: {
    type: DataTypes.DECIMAL(32, 8),
    defaultValue: 0,
  },
  netAmount: {
    type: DataTypes.DECIMAL(32, 8),
    allowNull: true,
  },
  fromAddress: {
    type: DataTypes.STRING(42),
    allowNull: false,
  },
  toAddress: {
    type: DataTypes.STRING(42),
    allowNull: false,
  },
  txHash: {
    type: DataTypes.STRING(66),
    unique: true,
    allowNull: true,
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  memo: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['tx_hash'], unique: true },
    { fields: ['status'] },
    { fields: ['from_address'] },
    { fields: ['to_address'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Transaction;
