const request = require('supertest');
const app = require('../src/app');
const { User, OtpLog, Referral, SupportTicket, Notification, IntegratedApp } = require('../src/models');
const jwtService = require('../src/services/jwtService');

jest.mock('../src/config/db', () => {
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize('sqlite::memory:', { logging: false, dialect: 'sqlite' });
  return { sequelize, connectDb: async () => { await sequelize.sync({ force: true }); } };
});

jest.mock('../src/config/redis', () => ({
  redis: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    pexpire: jest.fn().mockResolvedValue(1),
  },
}));

jest.mock('../src/config/web3', () => ({
  initWeb3: jest.fn().mockResolvedValue({}),
  getWeb3: jest.fn().mockReturnValue({
    utils: { toWei: jest.fn(), fromWei: jest.fn().mockReturnValue('100') },
    eth: {
      getGasPrice: jest.fn().mockResolvedValue('20000000000'),
      accounts: { privateKeyToAccount: jest.fn().mockReturnValue({}), wallet: { add: jest.fn() } },
    },
  }),
  getContract: jest.fn().mockResolvedValue({
    methods: {
      balanceOf: jest.fn().mockReturnValue({ call: jest.fn().mockResolvedValue('100000000000000000000') }),
      transfer: jest.fn().mockReturnValue({ estimateGas: jest.fn().mockResolvedValue(50000), send: jest.fn().mockResolvedValue({ transactionHash: '0xabc', blockNumber: 12345 }) }),
      accumulate: jest.fn().mockReturnValue({ estimateGas: jest.fn().mockResolvedValue(50000), send: jest.fn().mockResolvedValue({ transactionHash: '0xdef', blockNumber: 12346 }) }),
      totalAccumulated: jest.fn().mockReturnValue({ call: jest.fn().mockResolvedValue('50000000000000000000') }),
      lastAccumulation: jest.fn().mockReturnValue({ call: jest.fn().mockResolvedValue('1700000000') }),
    },
  }),
}));

let token;
let userId;

beforeAll(async () => {
  const { connectDb } = require('../src/config/db');
  await connectDb();
});

describe('Health', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('User', () => {
  it('POST /api/user/register creates user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.accessToken).toBeDefined();
    token = res.body.accessToken;
    userId = res.body.user.id;
  });

  it('POST /api/user/register rejects duplicate', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('POST /api/user/login succeeds', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    token = res.body.accessToken;
  });

  it('POST /api/user/login rejects bad password', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'test@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('GET /api/user/profile returns profile', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@test.com');
  });

  it('GET /api/user/profile rejects no auth', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/user/profile updates profile', async () => {
    const res = await request(app)
      .patch('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ mfsAddress: '0x1234567890123456789012345678901234567890' });
    expect(res.status).toBe(200);
    expect(res.body.user.mfsAddress).toBe('0x1234567890123456789012345678901234567890');
  });

  it('POST /api/user/refresh rotates tokens', async () => {
    const user = await User.findByPk(userId);
    const res = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken: user.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    token = res.body.accessToken;
  });

  it('POST /api/user/logout clears refresh token', async () => {
    const res = await request(app)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/user/otp/send sends OTP to all channels', async () => {
    const res = await request(app)
      .post('/api/user/otp/send')
      .send({ recipient: 'otp@test.com', purpose: 'register' });
    expect(res.status).toBe(200);
  });
});

describe('Wallet', () => {
  beforeEach(async () => {
    const user = await User.findByPk(userId);
    user.mfsAddress = '0x1234567890123456789012345678901234567890';
    await user.save();
    const { Wallet } = require('../src/models');
    await Wallet.findOrCreate({ where: { userId, address: '0x1234567890123456789012345678901234567890' }, defaults: { userId, address: '0x1234567890123456789012345678901234567890', label: 'Default', isDefault: true, encryptedKey: '0xabc' } });
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'test@test.com', password: 'password123' });
    token = loginRes.body.accessToken;
  });

  it('GET /api/wallet/balance returns balance', async () => {
    const res = await request(app)
      .get('/api/wallet/balance')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.balance).toBeDefined();
  });

  it('POST /api/wallet/send initiates send and dispatches OTP', async () => {
    const res = await request(app)
      .post('/api/wallet/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ toAddress: '0x0000000000000000000000000000000000000001', amount: 10, memo: 'test' });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('OTP');
  });

  it('POST /api/wallet/send/verify-otp completes send after OTP', async () => {
    const bcrypt = require('bcryptjs');
    const user = await User.findByPk(userId);
    user.email = 'test@test.com';
    await user.save();
    const pendingTx = JSON.stringify({ toAddress: '0x0000000000000000000000000000000000000001', amount: 10, memo: 'test', fromAddress: user.mfsAddress, encryptedKey: '0xabc' });
    const { redis } = require('../src/config/redis');
    redis.get.mockResolvedValue(pendingTx);

    const { OtpLog } = require('../src/models');
    const otpHash = await bcrypt.hash('123456', 8);
    await OtpLog.create({
      userId, channel: 'email', recipient: 'test@test.com', purpose: 'send',
      otpHash, expiresAt: new Date(Date.now() + 600000), verified: false,
    });

    const res = await request(app)
      .post('/api/wallet/send/verify-otp')
      .set('Authorization', `Bearer ${token}`)
      .send({ toAddress: '0x0000000000000000000000000000000000000001', amount: 10, memo: 'test', otp: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.txHash).toBe('0xabc');
  });

  it('GET /api/wallet/transactions returns list', async () => {
    const res = await request(app)
      .get('/api/wallet/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.transactions).toBeDefined();
  });

  it('GET /api/wallet/qr generates QR', async () => {
    const res = await request(app)
      .get('/api/wallet/qr')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.qrCode).toBeDefined();
  });
});

describe('Coins', () => {
  it('POST /api/coins/trigger triggers accumulation', async () => {
    const res = await request(app)
      .post('/api/coins/trigger')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.txHash).toBe('0xdef');
  });

  it('GET /api/coins/status returns status', async () => {
    const res = await request(app)
      .get('/api/coins/status')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalAccumulated).toBeDefined();
  });
});

describe('Referral', () => {
  let refToken;
  beforeAll(async () => {
    const refRes = await request(app)
      .post('/api/user/register')
      .send({ email: 'referrer@test.com', password: 'password123' });
    refToken = refRes.body.accessToken;
    const reffedRes = await request(app)
      .post('/api/user/register')
      .send({ email: 'referred@test.com', password: 'password123', referralCode: refRes.body.user.referralCode });
  });

  it('GET /api/referral returns stats', async () => {
    const res = await request(app)
      .get('/api/referral')
      .set('Authorization', `Bearer ${refToken}`);
    expect(res.status).toBe(200);
    expect(res.body.totalReferrals).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/referral/tree returns tree', async () => {
    const res = await request(app)
      .get('/api/referral/tree')
      .set('Authorization', `Bearer ${refToken}`);
    expect(res.status).toBe(200);
  });
});

describe('Support', () => {
  it('POST /api/support creates ticket', async () => {
    const res = await request(app)
      .post('/api/support')
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Test ticket', category: 'general', message: 'Need help' });
    expect(res.status).toBe(201);
    expect(res.body.ticket.subject).toBe('Test ticket');
  });

  it('GET /api/support lists tickets', async () => {
    const res = await request(app)
      .get('/api/support')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.tickets.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/support/:id/message adds message', async () => {
    const listRes = await request(app)
      .get('/api/support')
      .set('Authorization', `Bearer ${token}`);
    const ticketId = listRes.body.tickets[0].id;
    const res = await request(app)
      .post(`/api/support/${ticketId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Follow-up' });
    expect(res.status).toBe(200);
  });

  it('POST /api/support/:id/close closes ticket', async () => {
    const listRes = await request(app)
      .get('/api/support')
      .set('Authorization', `Bearer ${token}`);
    const ticketId = listRes.body.tickets[0].id;
    const res = await request(app)
      .post(`/api/support/${ticketId}/close`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Notifications', () => {
  beforeAll(async () => {
    await Notification.create({ userId, type: 'system', title: 'Welcome', body: 'Welcome to MFS' });
    await Notification.create({ userId, type: 'transaction', title: 'Tx', body: 'Transaction confirmed' });
  });

  it('GET /api/notifications lists notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(2);
    expect(res.body.unreadCount).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/notifications/read marks all read', async () => {
    const res = await request(app)
      .post('/api/notifications/read')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Integration', () => {
  it('POST /api/integration creates app', async () => {
    const res = await request(app)
      .post('/api/integration')
      .set('Authorization', `Bearer ${token}`)
      .send({ appName: 'MyApp', permissions: ['read', 'write'] });
    expect(res.status).toBe(201);
    expect(res.body.app.apiKey).toBeDefined();
  });

  it('GET /api/integration lists apps', async () => {
    const res = await request(app)
      .get('/api/integration')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.apps.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Validation', () => {
  it('POST /api/user/register with no email/phone returns 422', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ password: 'password123' });
    expect(res.status).toBe(422);
  });

  it('POST /api/wallet/send with bad address returns 422', async () => {
    const res = await request(app)
      .post('/api/wallet/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ toAddress: 'invalid', amount: 10 });
    expect(res.status).toBe(422);
  });
});
