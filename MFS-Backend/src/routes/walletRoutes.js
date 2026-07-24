const router = require('express').Router();
const ctrl = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const Joi = require('joi');
const { validate } = require('../middleware/validate');

const sendSchema = Joi.object({
  toAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  amount: Joi.number().positive().required(),
  memo: Joi.string().max(500).optional(),
});

const verifySendSchema = Joi.object({
  toAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  amount: Joi.number().positive().required(),
  memo: Joi.string().max(500).optional(),
  otp: Joi.string().length(6).required(),
});

router.get('/balance', authenticate, ctrl.getWalletBalance);
router.post('/send', authenticate, rateLimiter({ windowMs: 60000, max: 5, keyPrefix: 'send' }), validate(sendSchema), ctrl.initiateSend);
router.post('/send/verify-otp', authenticate, rateLimiter({ windowMs: 60000, max: 5, keyPrefix: 'sendv' }), validate(verifySendSchema), ctrl.completeSend);
router.get('/transactions', authenticate, ctrl.getTransactions);
router.get('/qr', authenticate, ctrl.generateQr);

module.exports = router;
