import api from './api';

export const referralService = {
  getStats: () => api.get('/referral').then((r) => r.data),

  getTree: () => api.get('/referral/tree').then((r) => r.data),
};
