import api from './api';

export const authService = {
  register: (data: { email?: string; phone?: string; password: string; referralCode?: string }) =>
    api.post('/user/register', data).then((r) => r.data),

  login: (data: { email?: string; phone?: string; password: string }) =>
    api.post('/user/login', data).then((r) => r.data),

  getProfile: () => api.get('/user/profile').then((r) => r.data),

  updateProfile: (data: Record<string, unknown>) => api.patch('/user/profile', data).then((r) => r.data),

  logout: () => api.post('/user/logout').then((r) => r.data),

  refresh: (refreshToken: string) => api.post('/user/refresh', { refreshToken }).then((r) => r.data),
};
