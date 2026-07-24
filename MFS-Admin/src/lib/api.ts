import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const rt = useAuthStore.getState().refreshToken;
      if (rt) {
        try {
          const { data } = await axios.post('/api/user/refresh', { refreshToken: rt });
          useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
          orig.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(orig);
        } catch { useAuthStore.getState().logout(); }
      }
    }
    return Promise.reject(err);
  },
);
