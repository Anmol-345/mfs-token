import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { formatNumber } from '../lib/utils';
import type { Transaction } from '../types';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-txs', search, page, statusFilter],
    queryFn: () => adminService.getTransactions({ search, page, limit: 15, status: statusFilter || undefined }),
  });

  const txs: Transaction[] = data?.transactions ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / 15);

  return (
    <div className="animate-fadeIn space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Transaction Explorer</h1>

      <div className="flex gap-2 flex-wrap">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by tx hash or address..." className="bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-text-primary flex-1 min-w-[200px] max-w-md focus:outline-none focus:border-primary" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary">
          <option value="">All Status</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="failed">Failed</option>
        </select>
        <button className="px-4 py-2 bg-bg-elevated text-text-secondary text-sm rounded-lg hover:bg-border">Export CSV</button>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" />)}</div>
          ) : isError ? (
            <div className="p-6 text-center text-error text-sm">Failed to load transactions</div>
          ) : txs.length === 0 ? (
            <div className="p-6 text-center text-text-muted text-sm">No transactions found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase border-b border-border">
                  <th className="text-left py-3 px-4">TX Hash</th><th className="text-left py-3 px-4">From</th><th className="text-left py-3 px-4">To</th><th className="text-center py-3 px-4">Type</th><th className="text-right py-3 px-4">Amount</th><th className="text-center py-3 px-4">Status</th><th className="text-right py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 text-text-primary hover:bg-bg-elevated/50">
                    <td className="py-3 px-4 font-mono text-xs">{(tx.txHash ?? tx.id).slice(0, 14)}...</td>
                    <td className="py-3 px-4 font-mono text-xs text-text-muted">{tx.fromAddress?.slice(0, 10) ?? '—'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-text-muted">{tx.toAddress?.slice(0, 10) ?? '—'}</td>
                    <td className="py-3 px-4 text-center capitalize">{tx.type ?? 'transfer'}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(tx.amount)} MFS</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'confirmed' ? 'bg-success/10 text-success' : tx.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>{tx.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-text-secondary text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-text-muted">{total} transactions</span>
          <div className="flex gap-2 items-center">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 text-xs rounded bg-bg-elevated text-text-secondary disabled:opacity-30">Prev</button>
            <span className="text-xs text-text-muted">{page} / {totalPages || 1}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1 text-xs rounded bg-bg-elevated text-text-secondary disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
