const { SupportTicket } = require('../models');

async function createTicket(req, res, next) {
  try {
    const { subject, category, message } = req.body;
    const ticket = await SupportTicket.create({
      userId: req.user.sub,
      subject,
      category: category || 'general',
      messages: [{ from: req.user.sub, body: message, createdAt: new Date() }],
    });
    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
}

async function listTickets(req, res, next) {
  try {
    const tickets = await SupportTicket.findAll({
      where: { userId: req.user.sub },
      order: [['created_at', 'DESC']],
    });
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
}

async function getTicket(req, res, next) {
  try {
    const ticket = await SupportTicket.findOne({ where: { id: req.params.id, userId: req.user.sub } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

async function addMessage(req, res, next) {
  try {
    const ticket = await SupportTicket.findOne({ where: { id: req.params.id, userId: req.user.sub } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (['resolved', 'closed'].includes(ticket.status)) return res.status(400).json({ error: 'Ticket is closed' });
    const newMessage = { from: req.user.sub, body: req.body.message, createdAt: new Date() };
    ticket.messages = [...(ticket.messages || []), newMessage];
    ticket.changed('messages', true);
    await ticket.save();
    
    try {
      const io = require('../utils/socket').getIO();
      io.to(`ticket_${ticket.id}`).emit('new_message', newMessage);
      io.emit('admin_ticket_update');
    } catch (e) {}

    res.json({ ticket: ticket.toJSON() });
  } catch (err) {
    next(err);
  }
}

async function closeTicket(req, res, next) {
  try {
    const ticket = await SupportTicket.findOne({ where: { id: req.params.id, userId: req.user.sub } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    await ticket.update({ status: 'closed', resolvedAt: new Date() });
    res.json({ message: 'Ticket closed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTicket, listTickets, getTicket, addMessage, closeTicket };
