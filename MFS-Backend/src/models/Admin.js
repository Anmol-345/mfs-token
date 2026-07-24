const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPORT'),
    allowNull: false,
    defaultValue: 'SUPPORT',
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'admins',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.passwordHash) {
        admin.passwordHash = await bcrypt.hash(admin.passwordHash, 10);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('passwordHash')) {
        admin.passwordHash = await bcrypt.hash(admin.passwordHash, 10);
      }
    },
  },
});

Admin.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = Admin;
