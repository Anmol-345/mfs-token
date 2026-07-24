const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, OtpLog } = require('../models');
const { signAccessToken, signRefreshToken, rotateRefreshToken } = require('../services/jwtService');
const { createAndSendOtp, verifyOtp } = require('../services/otpService');
const { env } = require('../config/env');
const logger = require('../utils/logger');

function generateReferralCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

async function register(req, res, next) {
  try {
    const { email, phone, password, referralCode } = req.body;
    const existing = await User.findOne({ where: { email: email || null, phone: phone || null } });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ where: { referralCode } });
      if (referrer) referredBy = referrer.id;
    }

    const { Web3 } = require('web3');
    const { Wallet } = require('../models');
    const web3 = new Web3();
    const account = web3.eth.accounts.create();

    const user = await User.create({
      email: email || null,
      phone: phone || null,
      passwordHash,
      referralCode: generateReferralCode(),
      referredBy,
      mfsAddress: account.address,
    });

    await Wallet.create({
      userId: user.id,
      address: account.address,
      encryptedKey: account.privateKey,
      isDefault: true
    });

    if (referredBy) {
      const { Referral } = require('../models');
      await Referral.create({ referrerId: referredBy, referredId: user.id, level: 1 });
    }

    const payload = { sub: user.id, email: user.email, role: 'user' };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await user.update({ refreshToken });

    res.status(201).json({
      user: { id: user.id, email: user.email, phone: user.phone, referralCode: user.referralCode, kycLevel: user.kycLevel, mfsAddress: user.mfsAddress },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, phone, password } = req.body;
    const user = await User.findOne({ where: { ...(email ? { email } : { phone }) } });
    if (!user || user.status !== 'active') return res.status(401).json({ error: 'Invalid credentials' });

    if (user.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { sub: user.id, email: user.email, role: 'user' };
    const tokens = await rotateRefreshToken(user.id);
    user.lastLoginAt = new Date();
    await user.save();

    res.json({ user: { id: user.id, email: user.email, phone: user.phone, referralCode: user.referralCode, kycLevel: user.kycLevel, mfsAddress: user.mfsAddress }, ...tokens });
  } catch (err) {
    next(err);
  }
}

async function requestOtp(req, res, next) {
  try {
    const { recipient, purpose } = req.body;
    await createAndSendOtp({ userId: null, recipient, purpose });
    res.json({ message: 'OTP sent' });
  } catch (err) {
    next(err);
  }
}

async function verifyOtpHandler(req, res, next) {
  try {
    const { recipient, purpose, otp } = req.body;
    await verifyOtp({ recipient, purpose, otp });
    res.json({ message: 'OTP verified' });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.sub, {
      attributes: { exclude: ['passwordHash', 'refreshToken'] },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updates = {};
    if (req.body.email) updates.email = req.body.email;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.mfsAddress) updates.mfsAddress = req.body.mfsAddress;
    if (req.body.walletAddress) updates.walletAddress = req.body.walletAddress;
    await User.update(updates, { where: { id: req.user.sub } });
    const user = await User.findByPk(req.user.sub, {
      attributes: { exclude: ['passwordHash', 'refreshToken'] },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function refreshTokenHandler(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const { verifyRefreshToken } = require('../services/jwtService');
    const decoded = verifyRefreshToken(refreshToken);
    const tokens = await rotateRefreshToken(decoded.sub);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await User.update({ refreshToken: null }, { where: { id: req.user.sub } });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, requestOtp, verifyOtpHandler, getProfile, updateProfile, refreshTokenHandler, logout };
