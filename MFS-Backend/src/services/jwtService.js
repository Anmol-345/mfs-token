const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { User } = require('../models');

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

async function rotateRefreshToken(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  const payload = { sub: user.id, email: user.email, role: 'user' };
  const newRefresh = signRefreshToken(payload);
  await user.update({ refreshToken: newRefresh });
  return { accessToken: signAccessToken(payload), refreshToken: newRefresh };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
};
