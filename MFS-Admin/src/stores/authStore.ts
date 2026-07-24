import { create } from 'zustand';

interface AuthState {
  admin: { id: string; email: string; name: string; role: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: any, accessToken: string, refreshToken: string) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setAuth: (admin, accessToken, refreshToken) => set({ admin, accessToken, refreshToken, isAuthenticated: true }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  logout: () => set({ admin: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
}));
