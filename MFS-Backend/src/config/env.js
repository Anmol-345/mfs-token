require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  isDev: process.env.NODE_ENV !== 'production',
  isTest: process.env.NODE_ENV === 'test',

  blockchain: {
    rpcUrl: process.env.RPC_URL || '',
    ipcSocketPath: process.env.IPC_SOCKET_PATH || '/var/lib/geth/sepolia/geth.ipc',
    mfsContractAddress: process.env.MFS_CONTRACT_ADDRESS || '',
    companyFeeAddress: process.env.MFS_COMPANY_FEE_ADDRESS || '',
    mainWalletAddress: process.env.MFS_MAIN_WALLET_ADDRESS || '',
    sepoliaChainId: parseInt(process.env.SEPOLIA_CHAIN_ID, 10) || 11155111,
    adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || '',
  },

  db: {
    url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/mfs_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'mfs_db',
    user: process.env.DB_USER || 'user',
    pass: process.env.DB_PASS || 'pass',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  otp: {
    allowedAttempts: 5,
    cooldownSeconds: 60,
    expiryMinutes: 10,
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'otp@ginie.xyz',
  },


  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || './firebase-key.json',
  },
};

module.exports = { env };
