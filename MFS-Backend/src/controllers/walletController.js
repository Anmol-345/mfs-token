const { getBalance, getEthBalance, sendTokens, getTransactionHistory, validateSufficientBalance } = require('../services/transferService');
const { createAndSendOtp, verifyOtp } = require('../services/otpService');
const { User, Wallet } = require('../models');
const { redis } = require('../config/redis');
const QRCode = require('qrcode');
const logger = require('../utils/logger');

async function getWalletBalance(req, res, next) {
  try {
    const user = await User.findByPk(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.mfsAddress) {
      const { Web3 } = require('web3');
      const { Wallet } = require('../models');
      const web3 = new Web3();
      const account = web3.eth.accounts.create();
      
      user.mfsAddress = account.address;
      await user.save();
      
      await Wallet.create({
        userId: user.id,
        address: account.address,
        encryptedKey: account.privateKey,
        isDefault: true
      });
      logger.info('Auto-generated wallet for user', { userId: user.id, address: account.address });
    }
    const balance = await getBalance(user.mfsAddress);
    const ethBalance = await getEthBalance(user.mfsAddress);
    const balanceDecimal = parseFloat(balance).toFixed(8);
    const ethBalanceDecimal = parseFloat(ethBalance).toFixed(8);
    res.json({ address: user.mfsAddress, balance: balanceDecimal, ethBalance: ethBalanceDecimal });
  } catch (err) {
    next(err);
  }
}

async function initiateSend(req, res, next) {
  try {
    const { toAddress, amount, memo } = req.body;
    const user = await User.findByPk(req.user.sub);
    if (!user || !user.mfsAddress) return res.status(400).json({ error: 'No MFS address set' });

    const wallet = await Wallet.findOne({ where: { userId: user.id, isDefault: true } });
    if (!wallet || !wallet.encryptedKey) return res.status(400).json({ error: 'No unlocked wallet' });

    await validateSufficientBalance(user.mfsAddress, amount);

    if (!user.email) return res.status(400).json({ error: 'Email is required for OTP verification. Please update your profile.' });

    await createAndSendOtp({
      userId: user.id,
      recipient: user.email,
      purpose: 'verify',
    });

    const pendingKey = `pending_tx:${user.id}`;
    await redis.set(pendingKey, JSON.stringify({ toAddress, amount, memo, fromAddress: user.mfsAddress, encryptedKey: wallet.encryptedKey }), 'EX', 600);

    logger.info('Send initiated, OTP dispatched', { userId: user.id, toAddress, amount });
    res.json({ message: 'OTP sent to your registered channels. Use /wallet/send/verify-otp to confirm.' });
  } catch (err) {
    next(err);
  }
}

async function completeSend(req, res, next) {
  try {
    const { toAddress, amount, memo, otp } = req.body;
    const user = await User.findByPk(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const recipient = user.email || user.phone;
    await verifyOtp({ recipient, purpose: 'verify', otp });

    const pendingKey = `pending_tx:${user.id}`;
    const pendingRaw = await redis.get(pendingKey);
    if (!pendingRaw) return res.status(400).json({ error: 'No pending transfer found. Start a new send request.' });

    const pending = JSON.parse(pendingRaw);
    if (pending.toAddress !== toAddress || parseFloat(pending.amount) !== parseFloat(amount)) {
      return res.status(400).json({ error: 'Pending transfer details do not match. Re-submit the send request.' });
    }

    await redis.del(pendingKey);

    const wallet = await Wallet.findOne({ where: { userId: user.id, isDefault: true } });
    if (!wallet || !wallet.encryptedKey) return res.status(400).json({ error: 'No unlocked wallet' });

    const result = await sendTokens({
      fromAddress: user.mfsAddress,
      toAddress,
      amount: amount.toString(),
      privateKey: wallet.encryptedKey,
      memo,
      userId: user.id,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await getTransactionHistory({ userId: req.user.sub, limit: parseInt(limit), offset: parseInt(offset) });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function generateQr(req, res, next) {
  try {
    const user = await User.findByPk(req.user.sub);
    if (!user || !user.mfsAddress) return res.status(400).json({ error: 'No MFS address' });
    const qr = await QRCode.toDataURL(user.mfsAddress);
    res.json({ address: user.mfsAddress, qrCode: qr });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWalletBalance, initiateSend, completeSend, getTransactions, generateQr };
