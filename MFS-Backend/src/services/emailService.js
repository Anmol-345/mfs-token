const { env } = require('../config/env');
const logger = require('../utils/logger');

async function sendEmail({ to, subject, html }) {
  if (env.isTest) return;
  const { Resend } = require('resend');
  const resend = new Resend(env.resend.apiKey);
  
  const { data, error } = await resend.emails.send({
    from: env.resend.fromEmail,
    to: [to],
    subject,
    html
  });

  if (error) {
    logger.error('Resend email failed', { error, to });
    const err = new Error(`Email delivery failed: ${error.message || JSON.stringify(error)}`);
    err.statusCode = 502;
    throw err;
  }

  logger.info('Email sent', { to, subject });
}

module.exports = { sendEmail };
