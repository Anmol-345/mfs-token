const { env } = require('../config/env');
const logger = require('../utils/logger');

async function sendSms({ to, body }) {
  if (env.isTest) return;
  const twilio = require('twilio')(env.twilio.accountSid, env.twilio.authToken);
  await twilio.messages.create({ body, from: env.twilio.fromNumber, to });
  logger.info('SMS sent', { to });
}

module.exports = { sendSms };
