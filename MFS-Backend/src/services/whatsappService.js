const { env } = require('../config/env');
const logger = require('../utils/logger');

async function sendWhatsApp({ to, template, parameters }) {
  if (env.isTest) return;
  const url = `https://graph.facebook.com/v18.0/${env.metaWa.phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: to.replace('+', ''),
    type: 'template',
    template: {
      name: template || env.metaWa.templateName,
      language: { code: 'en' },
      components: parameters
        ? [{ type: 'body', parameters: parameters.map((p) => ({ type: 'text', text: p })) }]
        : undefined,
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.metaWa.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`WhatsApp API error: ${res.status} ${await res.text()}`);
  logger.info('WhatsApp sent', { to, template });
}

module.exports = { sendWhatsApp };
