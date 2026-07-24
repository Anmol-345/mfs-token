'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admins', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      email: { type: Sequelize.STRING(255), unique: true, allowNull: false },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPORT'), defaultValue: 'SUPPORT', allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      is_suspended: { type: Sequelize.BOOLEAN, defaultValue: false },
      refresh_token: { type: Sequelize.TEXT, allowNull: true },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admins');
  },
};
