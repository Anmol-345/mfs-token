const router = require('express').Router();
const ctrl = require('../controllers/coinsController');
const { authenticate } = require('../middleware/auth');

router.post('/trigger', authenticate, ctrl.triggerAccumulation);
router.get('/status', authenticate, ctrl.getAccumulationStatus);

module.exports = router;
