const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OtpLog } = require('../models');
const { env } =require('../config/env');
const logger = require('../utils/logger');

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 8);
}

async function sendOtpEmail(recipient, otp) {
  if (env.isTest) return;
  const { sendEmail } = require('./emailService');
  const html = `
    <div style="background-color: #0d0d12; color: #ffffff; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #2a2a3e;">
      <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px;">MFS Crypto</h1>
      <p style="color: #a0a0b0; font-size: 16px; margin-bottom: 30px;">Verify your identity to proceed</p>
      
      <div style="background-color: #1a1a26; padding: 24px; border-radius: 8px; margin-bottom: 30px;">
        <p style="color: #a0a0b0; font-size: 14px; margin-top: 0; margin-bottom: 12px;">Your one-time password (OTP) is:</p>
        <h2 style="color: #7b61ff; font-size: 36px; letter-spacing: 6px; margin: 0; font-weight: 700;">${otp}</h2>
      </div>
      
      <p style="color: #6b6b80; font-size: 12px;">This code expires in ${env.otp.expiryMinutes} minutes. Do not share this code with anyone.</p>
    </div>
  `;

  await sendEmail({
    to: recipient,
    subject: 'Your MFS Crypto Verification Code',
    html,
  });
}

async function createAndSendOtp({ userId, recipient, purpose }) {
  const cooldown = env.otp.cooldownSeconds;
  const recent = await OtpLog.findOne({
    where: { recipient, purpose, verified: false },
    order: [['created_at', 'DESC']],
  });
  if (recent && (Date.now() - new Date(recent.createdAt).getTime()) < cooldown * 1000) {
    const remaining = cooldown - Math.floor((Date.now() - new Date(recent.createdAt).getTime()) / 1000);
    throw Object.assign(new Error('Cooldown active'), { statusCode: 429, remaining });
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + env.otp.expiryMinutes * 60 * 1000);

  await OtpLog.create({ userId, channel: 'email', recipient, purpose, otpHash, expiresAt });

  if (env.isDev || env.isTest) {
    logger.info(`[DEV MODE] Generated OTP for ${recipient}: ${otp}`);
  }

  await sendOtpEmail(recipient, otp);
  logger.info('OTP delivered via email', { recipient });

  return true;
}

async function verifyOtp({ recipient, purpose, otp }) {
  const record = await OtpLog.findOne({
    where: { recipient, purpose, verified: false },
    order: [['created_at', 'DESC']],
  });
  if (!record) {
    throw Object.assign(new Error('No OTP found'), { statusCode: 404 });
  }
  if (new Date() > new Date(record.expiresAt)) {
    throw Object.assign(new Error('OTP expired'), { statusCode: 410 });
  }
  if (record.attempts >= env.otp.allowedAttempts) {
    await record.update({ verified: false });
    throw Object.assign(new Error('Too many attempts'), { statusCode: 429 });
  }
  const valid = await bcrypt.compare(otp, record.otpHash);
  if (!valid) {
    await record.increment('attempts');
    throw Object.assign(new Error('Invalid OTP'), { statusCode: 401 });
  }
  await record.update({ verified: true });
  return record;
}

module.exports = { generateOtp, createAndSendOtp, verifyOtp };
