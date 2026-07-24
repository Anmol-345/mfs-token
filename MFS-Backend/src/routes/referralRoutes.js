const router = require('express').Router();
const ctrl = require('../controllers/referralController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getReferralStats);
router.get('/tree', authenticate, ctrl.getReferralTree);

module.exports = router;
