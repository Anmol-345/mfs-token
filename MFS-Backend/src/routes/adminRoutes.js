const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { adminAuthenticate, requireRole } = require('../middleware/adminAuth');

router.post('/login', ctrl.login);

// Protect all routes below
router.use(adminAuthenticate);

// Admins Management
router.get('/admins', requireRole('SUPER_ADMIN'), ctrl.getAdmins);
router.post('/admins', requireRole('SUPER_ADMIN'), ctrl.createAdmin);
router.put('/admins/:id/suspend', requireRole('SUPER_ADMIN'), ctrl.suspendAdmin);

// Users & Wallets
router.get('/users', requireRole('ADMIN'), ctrl.getUsers);
router.get('/users/:id', requireRole('ADMIN'), ctrl.getUser);
router.put('/users/:id/freeze', requireRole('ADMIN'), ctrl.freezeUser);
router.put('/users/:id/kyc', requireRole('ADMIN'), ctrl.updateKyc);
router.post('/users/:id/fund-gas', requireRole('ADMIN'), ctrl.fundGas);
router.get('/wallets', requireRole('ADMIN'), ctrl.getWallets);
router.put('/wallets/:address/freeze', requireRole('ADMIN'), ctrl.freezeWallet);

// Analytics & Transactions
router.get('/transactions', requireRole('ADMIN'), ctrl.getTransactions);
router.get('/analytics/overview', requireRole('ADMIN'), ctrl.getAnalyticsOverview);
router.get('/analytics/charts', requireRole('ADMIN'), ctrl.getAnalyticsCharts);

// Token Config & Faucet
router.get('/token/config', requireRole('SUPER_ADMIN'), ctrl.getTokenConfig);
router.put('/token/fee', requireRole('SUPER_ADMIN'), ctrl.updateFee);
router.put('/token/fee-address', requireRole('SUPER_ADMIN'), ctrl.updateFeeAddress);
router.post('/token/pause', requireRole('SUPER_ADMIN'), ctrl.togglePause);
router.delete('/token/pause', requireRole('SUPER_ADMIN'), ctrl.togglePause);
router.post('/token/mint', requireRole('SUPER_ADMIN'), ctrl.mintTokens);

// Support Tickets
router.get('/support/tickets', requireRole('SUPPORT', 'ADMIN'), ctrl.getTickets);
router.post('/support/tickets/:id/reply', requireRole('SUPPORT', 'ADMIN'), ctrl.replyTicket);
router.post('/support/tickets/:id/close', requireRole('SUPPORT', 'ADMIN'), ctrl.closeTicket);

// Notifications
router.post('/notifications/broadcast', requireRole('ADMIN'), ctrl.broadcastNotification);

module.exports = router;
