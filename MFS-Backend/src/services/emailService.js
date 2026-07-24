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
    logger.error('Resend email failed', { error });
    throw new Error(error.message);
  }

  logger.info('Email sent', { to, subject });
}

module.exports = { sendEmail };
