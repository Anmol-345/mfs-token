const { Notification } = require('../models');

async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.sub },
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    const unreadCount = await Notification.count({ where: { userId: req.user.sub, read: false } });
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { ids } = req.body;
    if (ids && Array.isArray(ids)) {
      await Notification.update({ read: true }, { where: { id: ids, userId: req.user.sub } });
    } else {
      await Notification.update({ read: true }, { where: { userId: req.user.sub, read: false } });
    }
    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
}

async function markSingleRead(req, res, next) {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.sub } });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    await notif.update({ read: true });
    res.json({ notification: notif });
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.sub } });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    await notif.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markRead, markSingleRead, deleteNotification };
