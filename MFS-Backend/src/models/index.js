const User = require('./User');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const OtpLog = require('./OtpLog');
const Referral = require('./Referral');
const SupportTicket = require('./SupportTicket');
const Notification = require('./Notification');
const IntegratedApp = require('./IntegratedApp');
const Admin = require('./Admin');

User.hasMany(Wallet, { foreignKey: 'userId' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(OtpLog, { foreignKey: 'userId' });
OtpLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Referral, { foreignKey: 'referrerId', as: 'referralsMade' });
User.hasMany(Referral, { foreignKey: 'referredId', as: 'referralsReceived' });
Referral.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
Referral.belongsTo(User, { foreignKey: 'referredId', as: 'referred' });

User.hasMany(SupportTicket, { foreignKey: 'userId' });
SupportTicket.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(IntegratedApp, { foreignKey: 'userId' });
IntegratedApp.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Wallet,
  Transaction,
  OtpLog,
  Referral,
  SupportTicket,
  Notification,
  IntegratedApp,
  Admin,
};
