const router = require('express').Router();
const ctrl = require('../controllers/supportController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, ctrl.createTicket);
router.get('/', authenticate, ctrl.listTickets);
router.get('/:id', authenticate, ctrl.getTicket);
router.post('/:id/message', authenticate, ctrl.addMessage);
router.post('/:id/close', authenticate, ctrl.closeTicket);

module.exports = router;
