export interface User {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  referralCode: string;
  kycLevel: 'unverified' | 'basic' | 'advanced';
  mfsAddress?: string;
  walletAddress?: string;
}

export interface Transaction {
  id: string;
  txHash?: string;
  type: 'send' | 'receive' | 'accumulate' | 'fee' | 'genesis';
  status: 'pending' | 'confirmed' | 'failed';
  amount: string;
  fee: string;
  netAmount?: string;
  fromAddress: string;
  toAddress: string;
  memo?: string;
  blockNumber?: number;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  messages: TicketMessage[];
  createdAt: string;
}

export interface TicketMessage {
  from: string;
  body: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface IntegratedApp {
  id: string;
  appName: string;
  apiKey: string;
  webhookUrl?: string;
  permissions: string[];
  active: boolean;
}
