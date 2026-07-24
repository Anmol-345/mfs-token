import api from './api';

export const notificationService = {
  list: () => api.get('/notifications').then((r) => r.data),

  markRead: (ids?: string[]) =>
    api.post('/notifications/read', ids ? { ids } : {}).then((r) => r.data),

  markOneRead: (id: string) =>
    api.post(`/notifications/${id}/read`).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};
