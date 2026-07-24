const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.listNotifications);
router.post('/read', authenticate, ctrl.markRead);
router.post('/:id/read', authenticate, ctrl.markSingleRead);
router.delete('/:id', authenticate, ctrl.deleteNotification);

module.exports = router;
