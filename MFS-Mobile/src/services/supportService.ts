import api from './api';

export const supportService = {
  create: (data: { subject: string; category: string; message: string }) =>
    api.post('/support', data).then((r) => r.data),

  list: () => api.get('/support').then((r) => r.data),

  get: (id: string) => api.get(`/support/${id}`).then((r) => r.data),

  addMessage: (id: string, message: string) =>
    api.post(`/support/${id}/message`, { message }).then((r) => r.data),

  close: (id: string) => api.post(`/support/${id}/close`).then((r) => r.data),
};
