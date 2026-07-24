import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  onboardingComplete: boolean;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  setBiometric: (enabled: boolean) => void;
  setOnboardingComplete: () => void;
  logout: () => void;
}

const secureStorage = {
  getItem: async (name: string) => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      biometricEnabled: false,
      onboardingComplete: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setBiometric: (biometricEnabled) => set({ biometricEnabled }),
      setOnboardingComplete: () => set({ onboardingComplete: true }),
      logout: () =>
        set((state) => ({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          // We don't reset biometricEnabled so the preference persists for the device
        })),
    }),
    {
      name: 'mfs-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        biometricEnabled: state.biometricEnabled,
        onboardingComplete: state.onboardingComplete,
      }),
    },
  ),
);
