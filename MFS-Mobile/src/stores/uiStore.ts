import { create } from 'zustand';
import Toast from 'react-native-toast-message';

interface UIState {
  isLoading: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  toastMessage: null,
  toastType: 'info',
  setLoading: (isLoading) => set({ isLoading }),
  showToast: (toastMessage, toastType = 'info') => {
    set({ toastMessage, toastType });
    Toast.show({ type: toastType, text1: toastMessage });
  },
  hideToast: () => set({ toastMessage: null }),
}));
