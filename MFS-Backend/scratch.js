const { SupportTicket } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function test() {
  await sequelize.authenticate();
  console.log('Connected to DB');
  const ticket = await SupportTicket.findOne({ order: [['createdAt', 'DESC']] });
  console.log('Latest ticket:', ticket ? ticket.toJSON() : 'No tickets');
  console.log('typeof messages:', ticket ? typeof ticket.messages : 'N/A');
  console.log('Is Array?', ticket ? Array.isArray(ticket.messages) : 'N/A');
  process.exit(0);
}

test().catch(console.error);
