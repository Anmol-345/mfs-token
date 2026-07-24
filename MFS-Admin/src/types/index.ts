export interface AdminUser {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
  name: string;
  isSuspended: boolean;
  createdAt: string;
}

export interface AppUser {
  id: string;
  email?: string;
  phone?: string;
  referralCode: string;
  kycLevel: 'unverified' | 'basic' | 'advanced';
  status: 'active' | 'suspended' | 'banned';
  mfsAddress?: string;
  walletAddress?: string;
  referredBy?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  status: string;
  amount: string;
  fee: string;
  fromAddress: string;
  toAddress: string;
  txHash?: string;
  blockNumber?: number;
  memo?: string;
  createdAt: string;
}

export interface WalletInfo {
  id: string;
  userId: string;
  address: string;
  label: string;
  isDefault: boolean;
  balance?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  messages: { from: string; body: string; createdAt: string }[];
  createdAt: string;
}

export interface AnalyticsOverview {
  totalUsers: number;
  totalWallets: number;
  totalTransactions: number;
  circulatingSupply: number | string;
  feeRevenue30d: number | string;
  volume24h: number | string;
  usersToday: number;
  adminWallet?: string;
  adminBalance?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  secondary?: number;
}

export interface TokenConfig {
  transferFee: string;
  feeAddress: string;
  isPaused: boolean;
  feeExemptAddresses: string[];
}
