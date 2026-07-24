const router = require('express').Router();
const ctrl = require('../controllers/integrationController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, ctrl.createApp);
router.get('/', authenticate, ctrl.listApps);
router.delete('/:id', authenticate, ctrl.revokeApp);

module.exports = router;
