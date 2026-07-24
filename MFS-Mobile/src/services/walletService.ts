import api from './api';

export const walletService = {
  getBalance: () => api.get('/wallet/balance').then((r) => r.data),

  initiateSend: (data: { toAddress: string; amount: number; memo?: string }) =>
    api.post('/wallet/send', data).then((r) => r.data),

  completeSend: (data: { toAddress: string; amount: number; memo?: string; otp: string }) =>
    api.post('/wallet/send/verify-otp', data).then((r) => r.data),

  getTransactions: (limit = 50, offset = 0) =>
    api.get(`/wallet/transactions?limit=${limit}&offset=${offset}`).then((r) => r.data),

  getQr: () => api.get('/wallet/qr').then((r) => r.data),
};
