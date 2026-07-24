const app = require('./app');
const { connectDb } = require('./config/db');
const { initWeb3 } = require('./config/web3');
const { env } = require('./config/env');
const logger = require('./utils/logger');

const http = require('http');

async function main() {
  await connectDb();

  try {
    await initWeb3();
  } catch (err) {
    logger.warn('Web3 init failed — API will start without blockchain', { error: err.message });
  }

  try {
    const { Admin } = require('./models');
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      await Admin.create({
        email: 'admin@mfscrypto.com',
        passwordHash: 'admin123',
        role: 'SUPER_ADMIN',
        name: 'Super Admin'
      });
      logger.info('Default SUPER_ADMIN seeded (admin@mfscrypto.com / admin123)');
    }
  } catch (err) {
    logger.warn('Failed to seed admin', { error: err.message });
  }

  const server = http.createServer(app);
  const io = require('./utils/socket').init(server);

  io.on('connection', (socket) => {
    socket.on('join_ticket', (ticketId) => {
      socket.join(`ticket_${ticketId}`);
    });
  });

  server.listen(env.port, () => {
    logger.info(`MFS API running on port ${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
