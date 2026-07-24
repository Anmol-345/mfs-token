const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const Joi = require('joi');
const { validate } = require('../middleware/validate');

const registerSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().min(8).optional(),
  referralCode: Joi.string().alphanum().max(12).optional(),
}).or('email', 'phone');

const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().required(),
}).or('email', 'phone');

const otpSchema = Joi.object({
  recipient: Joi.string().max(255).required(),
  purpose: Joi.string().valid('register', 'login', 'verify', 'reset_password', 'send').required(),
});

const otpVerifySchema = Joi.object({
  recipient: Joi.string().max(255).required(),
  purpose: Joi.string().valid('register', 'login', 'verify', 'reset_password', 'send').required(),
  otp: Joi.string().length(6).required(),
});

router.post('/register', rateLimiter({ windowMs: 60000, max: 5, keyPrefix: 'register' }), validate(registerSchema), ctrl.register);
router.post('/login', rateLimiter({ windowMs: 60000, max: 10, keyPrefix: 'login' }), validate(loginSchema), ctrl.login);
router.post('/otp/send', rateLimiter({ windowMs: 900000, max: 5, keyPrefix: 'otp' }), validate(otpSchema), ctrl.requestOtp);
router.post('/otp/verify', rateLimiter({ windowMs: 60000, max: 10, keyPrefix: 'otpv' }), validate(otpVerifySchema), ctrl.verifyOtpHandler);
router.post('/refresh', ctrl.refreshTokenHandler);

router.get('/profile', authenticate, ctrl.getProfile);
router.patch('/profile', authenticate, ctrl.updateProfile);
router.post('/logout', authenticate, ctrl.logout);

module.exports = router;
