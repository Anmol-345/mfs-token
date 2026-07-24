const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MFS Crypto REST API',
      version: '1.0.0',
      description: 'Backend API for MFS Crypto wallet, coins, referrals, and support.',
      contact: { name: 'MFS Team' },
    },
    servers: [
      { url: '/api', description: 'API root' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            phone: { type: 'string' },
            referralCode: { type: 'string' },
            kycLevel: { type: 'string', enum: ['unverified', 'basic', 'advanced'] },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['send', 'receive', 'accumulate', 'fee', 'genesis'] },
            status: { type: 'string', enum: ['pending', 'confirmed', 'failed'] },
            amount: { type: 'string' },
            fee: { type: 'string' },
            fromAddress: { type: 'string' },
            toAddress: { type: 'string' },
            txHash: { type: 'string' },
            memo: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SupportTicket: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            subject: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string' },
            priority: { type: 'string' },
            messages: { type: 'array', items: { type: 'object' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/user/register': {
        post: {
          tags: ['User'],
          summary: 'Register a new user',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, phone: { type: 'string' }, password: { type: 'string' }, referralCode: { type: 'string' } } } } } },
          responses: { 201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 409: { description: 'Conflict' } },
        },
      },
      '/user/login': {
        post: {
          tags: ['User'],
          summary: 'Login',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, phone: { type: 'string' }, password: { type: 'string' } } } } } },
          responses: { 200: { description: 'Login success' } },
        },
      },
      '/user/otp/send': {
        post: { tags: ['User'], summary: 'Send OTP', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { channel: { type: 'string', enum: ['email', 'sms', 'whatsapp'] }, recipient: { type: 'string' }, purpose: { type: 'string', enum: ['register', 'login', 'verify', 'reset_password'] } } } } } }, responses: { 200: { description: 'OTP sent' } } },
      },
      '/user/otp/verify': {
        post: { tags: ['User'], summary: 'Verify OTP', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { recipient: { type: 'string' }, purpose: { type: 'string' }, otp: { type: 'string' } } } } } }, responses: { 200: { description: 'OTP verified' } } },
      },
      '/user/profile': {
        get: { tags: ['User'], summary: 'Get profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Profile' } } },
        patch: { tags: ['User'], summary: 'Update profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Updated' } } },
      },
      '/user/refresh': {
        post: { tags: ['User'], summary: 'Refresh tokens', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } }, responses: { 200: { description: 'New tokens' } } },
      },
      '/user/logout': {
        post: { tags: ['User'], summary: 'Logout', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Logged out' } } },
      },
      '/wallet/balance': {
        get: { tags: ['Wallet'], summary: 'Get MFS balance', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Balance' } } },
      },
      '/wallet/send': {
        post: { tags: ['Wallet'], summary: 'Send MFS tokens', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { toAddress: { type: 'string' }, amount: { type: 'number' }, memo: { type: 'string' } } } } } }, responses: { 200: { description: 'Tx sent' } } },
      },
      '/wallet/transactions': {
        get: { tags: ['Wallet'], summary: 'Transaction history', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Transactions', content: { 'application/json': { schema: { type: 'object', properties: { transactions: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } }, total: { type: 'integer' } } } } } } } },
      },
      '/wallet/qr': {
        get: { tags: ['Wallet'], summary: 'Generate QR code for address', security: [{ bearerAuth: [] }], responses: { 200: { description: 'QR code data URL' } } },
      },
      '/coins/trigger': {
        post: { tags: ['Coins'], summary: 'Trigger accumulation', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Accumulation triggered' } } },
      },
      '/coins/status': {
        get: { tags: ['Coins'], summary: 'Get accumulation status', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Status' } } },
      },
      '/referral': {
        get: { tags: ['Referral'], summary: 'Referral stats', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Stats' } } },
      },
      '/referral/tree': {
        get: { tags: ['Referral'], summary: 'Referral tree', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Tree' } } },
      },
      '/integration': {
        post: { tags: ['Integration'], summary: 'Create API app', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { appName: { type: 'string' }, webhookUrl: { type: 'string' }, permissions: { type: 'array', items: { type: 'string' } } } } } } }, responses: { 201: { description: 'App created' } } },
        get: { tags: ['Integration'], summary: 'List apps', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Apps' } } },
      },
      '/integration/{id}': {
        delete: { tags: ['Integration'], summary: 'Revoke app', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Revoked' } } },
      },
      '/support': {
        post: { tags: ['Support'], summary: 'Create ticket', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { subject: { type: 'string' }, category: { type: 'string' }, message: { type: 'string' } } } } } }, responses: { 201: { description: 'Ticket created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SupportTicket' } } } } } },
        get: { tags: ['Support'], summary: 'List tickets', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Tickets', content: { 'application/json': { schema: { type: 'object', properties: { tickets: { type: 'array', items: { $ref: '#/components/schemas/SupportTicket' } } } } } } } } },
      },
      '/support/{id}': {
        get: { tags: ['Support'], summary: 'Get ticket', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Ticket' } } },
      },
      '/support/{id}/message': {
        post: { tags: ['Support'], summary: 'Add message', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } }, responses: { 200: { description: 'Message added' } } },
      },
      '/support/{id}/close': {
        post: { tags: ['Support'], summary: 'Close ticket', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Closed' } } },
      },
      '/notifications': {
        get: { tags: ['Notifications'], summary: 'List notifications', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Notifications', content: { 'application/json': { schema: { type: 'object', properties: { notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } }, unreadCount: { type: 'integer' } } } } } } } },
      },
      '/notifications/read': {
        post: { tags: ['Notifications'], summary: 'Mark all as read', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } } } } } } }, responses: { 200: { description: 'Marked' } } },
      },
      '/notifications/{id}/read': {
        post: { tags: ['Notifications'], summary: 'Mark one as read', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Marked' } } },
      },
      '/health': {
        get: { tags: ['System'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
