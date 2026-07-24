'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      email: { type: Sequelize.STRING(255), unique: true, allowNull: true },
      phone: { type: Sequelize.STRING(20), unique: true, allowNull: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: true },
      email_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      phone_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      referral_code: { type: Sequelize.STRING(12), unique: true, allowNull: false },
      referred_by: { type: Sequelize.UUID, allowNull: true },
      mfs_address: { type: Sequelize.STRING(42), unique: true, allowNull: true },
      wallet_address: { type: Sequelize.STRING(42), unique: true, allowNull: true },
      kyc_level: { type: Sequelize.ENUM('unverified', 'basic', 'advanced'), defaultValue: 'unverified' },
      status: { type: Sequelize.ENUM('active', 'suspended', 'banned'), defaultValue: 'active' },
      refresh_token: { type: Sequelize.TEXT, allowNull: true },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('wallets', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      address: { type: Sequelize.STRING(42), unique: true, allowNull: false },
      label: { type: Sequelize.STRING(100), defaultValue: 'Default' },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: true },
      encrypted_key: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      type: { type: Sequelize.ENUM('send', 'receive', 'accumulate', 'fee', 'genesis'), allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'confirmed', 'failed'), defaultValue: 'pending' },
      amount: { type: Sequelize.DECIMAL(32, 8), allowNull: false },
      fee: { type: Sequelize.DECIMAL(32, 8), defaultValue: 0 },
      net_amount: { type: Sequelize.DECIMAL(32, 8), allowNull: true },
      from_address: { type: Sequelize.STRING(42), allowNull: false },
      to_address: { type: Sequelize.STRING(42), allowNull: false },
      tx_hash: { type: Sequelize.STRING(66), unique: true, allowNull: true },
      block_number: { type: Sequelize.INTEGER, allowNull: true },
      memo: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('otp_logs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      channel: { type: Sequelize.ENUM('email', 'sms', 'whatsapp'), allowNull: false },
      recipient: { type: Sequelize.STRING(255), allowNull: false },
      purpose: { type: Sequelize.ENUM('register', 'login', 'verify', 'reset_password'), allowNull: false },
      otp_hash: { type: Sequelize.STRING(255), allowNull: false },
      attempts: { type: Sequelize.INTEGER, defaultValue: 0 },
      verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('referrals', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      referrer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      referred_id: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      level: { type: Sequelize.INTEGER, defaultValue: 1 },
      reward_earned: { type: Sequelize.DECIMAL(32, 8), defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('support_tickets', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      subject: { type: Sequelize.STRING(255), allowNull: false },
      category: { type: Sequelize.ENUM('general', 'transaction', 'kyc', 'security', 'other'), defaultValue: 'general' },
      status: { type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'), defaultValue: 'open' },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
      messages: { type: Sequelize.JSONB, defaultValue: [] },
      assigned_to: { type: Sequelize.UUID, allowNull: true },
      resolved_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      type: { type: Sequelize.ENUM('transaction', 'system', 'kyc', 'referral', 'security', 'promo'), allowNull: false },
      title: { type: Sequelize.STRING(255), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      data: { type: Sequelize.JSONB, defaultValue: {} },
      read: { type: Sequelize.BOOLEAN, defaultValue: false },
      push_sent: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('integrated_apps', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      app_name: { type: Sequelize.STRING(255), allowNull: false },
      api_key: { type: Sequelize.STRING(64), unique: true, allowNull: false },
      webhook_url: { type: Sequelize.STRING(500), allowNull: true },
      permissions: { type: Sequelize.JSONB, defaultValue: ['read'] },
      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      last_used_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('wallets', ['user_id']);
    await queryInterface.addIndex('transactions', ['user_id', 'created_at']);
    await queryInterface.addIndex('otp_logs', ['recipient', 'purpose']);
    await queryInterface.addIndex('referrals', ['referrer_id']);
    await queryInterface.addIndex('support_tickets', ['user_id', 'status']);
    await queryInterface.addIndex('notifications', ['user_id', 'read']);
    await queryInterface.addIndex('integrated_apps', ['user_id']);
  },

  async down(queryInterface) {
    const tables = ['integrated_apps', 'notifications', 'support_tickets', 'referrals', 'otp_logs', 'transactions', 'wallets', 'users'];
    for (const t of tables) {
      await queryInterface.dropTable(t);
    }
  },
};
