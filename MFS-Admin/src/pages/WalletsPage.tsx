import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { shortenAddress } from '../lib/utils';
import type { WalletInfo } from '../types';

export default function WalletsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-wallets', search],
    queryFn: () => adminService.getWallets({ search }),
  });

  const freezeMutation = useMutation({
    mutationFn: ({ address, freeze }: { address: string; freeze: boolean }) => adminService.freezeWallet(address, freeze),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-wallets'] }),
  });

  const wallets: (WalletInfo & { frozen?: boolean })[] = data?.wallets ?? [];

  return (
    <div className="animate-fadeIn space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Wallet Management</h1>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by address or user..." className="bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-text-primary max-w-md focus:outline-none focus:border-primary" />

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" />)}</div>
          ) : isError ? (
            <div className="p-6 text-center text-error text-sm">Failed to load wallets</div>
          ) : wallets.length === 0 ? (
            <div className="p-6 text-center text-text-muted text-sm">No wallets found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase border-b border-border">
                  <th className="text-left py-3 px-4">Address</th><th className="text-left py-3 px-4">User</th><th className="text-left py-3 px-4">Label</th><th className="text-right py-3 px-4">Balance</th><th className="text-center py-3 px-4">Status</th><th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((w) => (
                  <tr key={w.id ?? w.address} className="border-b border-border/50 text-text-primary hover:bg-bg-elevated/50">
                    <td className="py-3 px-4 font-mono text-xs">{shortenAddress(w.address, 8)}</td>
                    <td className="py-3 px-4">{w.userId?.slice(0, 8) ?? '—'}</td>
                    <td className="py-3 px-4 text-text-secondary">{w.label ?? 'Default'}</td>
                    <td className="py-3 px-4 text-right">{w.balance ? `${parseFloat(w.balance).toLocaleString()} MFS` : '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${w.frozen ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>{w.frozen ? 'Frozen' : 'Active'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => freezeMutation.mutate({ address: w.address, freeze: !w.frozen })} disabled={freezeMutation.isPending} className={`text-xs ${w.frozen ? 'text-success' : 'text-error'} hover:underline disabled:opacity-50`}>{w.frozen ? 'Unfreeze' : 'Freeze'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
