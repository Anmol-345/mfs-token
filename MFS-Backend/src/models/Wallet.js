const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Wallet = sequelize.define('Wallet', {
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
  address: {
    type: DataTypes.STRING(42),
    unique: true,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING(100),
    defaultValue: 'Default',
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  encryptedKey: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'wallets',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['address'], unique: true },
  ],
});

module.exports = Wallet;
