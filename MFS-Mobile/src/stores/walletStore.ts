import { create } from 'zustand';
import type { Transaction } from '../types';

interface WalletState {
  balance: string;
  ethBalance: string;
  address: string;
  transactions: Transaction[];
  setBalance: (balance: string) => void;
  setEthBalance: (ethBalance: string) => void;
  setAddress: (address: string) => void;
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Transaction) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: '0.00000000',
  ethBalance: '0.0000',
  address: '',
  transactions: [],
  setBalance: (balance) => set({ balance }),
  setEthBalance: (ethBalance) => set({ ethBalance }),
  setAddress: (address) => set({ address }),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (tx) =>
    set((state) => ({ transactions: [tx, ...state.transactions] })),
}));
