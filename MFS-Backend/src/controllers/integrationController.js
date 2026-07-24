const crypto = require('crypto');
const { IntegratedApp } = require('../models');

async function createApp(req, res, next) {
  try {
    const { appName, webhookUrl, permissions } = req.body;
    const apiKey = crypto.randomBytes(32).toString('hex');
    const app = await IntegratedApp.create({
      userId: req.user.sub,
      appName,
      apiKey,
      webhookUrl: webhookUrl || null,
      permissions: permissions || ['read'],
    });
    res.status(201).json({ app: { id: app.id, appName: app.appName, apiKey: app.apiKey, webhookUrl: app.webhookUrl, permissions: app.permissions, active: app.active } });
  } catch (err) {
    next(err);
  }
}

async function listApps(req, res, next) {
  try {
    const apps = await IntegratedApp.findAll({ where: { userId: req.user.sub } });
    res.json({ apps });
  } catch (err) {
    next(err);
  }
}

async function revokeApp(req, res, next) {
  try {
    const { id } = req.params;
    const app = await IntegratedApp.findOne({ where: { id, userId: req.user.sub } });
    if (!app) return res.status(404).json({ error: 'App not found' });
    await app.update({ active: false });
    res.json({ message: 'App revoked' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createApp, listApps, revokeApp };
