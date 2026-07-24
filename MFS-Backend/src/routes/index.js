const router = require('express').Router();

router.use('/user', require('./userRoutes'));
router.use('/wallet', require('./walletRoutes'));
router.use('/coins', require('./coinsRoutes'));
router.use('/referral', require('./referralRoutes'));
router.use('/integration', require('./integrationRoutes'));
router.use('/support', require('./supportRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/admin', require('./adminRoutes'));

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
