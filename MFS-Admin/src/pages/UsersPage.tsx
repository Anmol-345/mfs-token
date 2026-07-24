import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { formatDate } from '../lib/utils';
import type { AppUser } from '../types';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminService.getUsers({ search, page, limit }),
  });

  const users: AppUser[] = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / limit);

  return (
    <div className="animate-fadeIn space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">User Management</h1>

      <div className="flex gap-2">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by email or phone..." className="bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-text-primary flex-1 max-w-md focus:outline-none focus:border-primary" />
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" />)}</div>
          ) : isError ? (
            <div className="p-6 text-center text-error text-sm">Failed to load users</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-text-muted text-sm">No users found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase border-b border-border">
                  <th className="text-left py-3 px-4">Email</th><th className="text-left py-3 px-4">Phone</th><th className="text-center py-3 px-4">KYC</th><th className="text-center py-3 px-4">Status</th><th className="text-left py-3 px-4">Wallet</th><th className="text-right py-3 px-4">Joined</th><th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 text-text-primary hover:bg-bg-elevated/50">
                    <td className="py-3 px-4">{u.email ?? '—'}</td>
                    <td className="py-3 px-4 text-text-secondary">{u.phone ?? '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.kycLevel === 'advanced' ? 'bg-success/10 text-success' : u.kycLevel === 'basic' ? 'bg-warning/10 text-warning' : 'bg-bg-elevated text-text-muted'}`}>{u.kycLevel}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{u.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-text-muted">{(u.walletAddress ?? u.mfsAddress ?? '').slice(0, 10)}...</span>
                        {(u.walletAddress ?? u.mfsAddress) && (
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(u.walletAddress ?? u.mfsAddress ?? '');
                            }}
                            className="text-text-muted hover:text-primary transition-colors text-xs"
                            title="Copy Wallet Address"
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-text-secondary text-xs">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <Link to={`/users/${encodeURIComponent(u.id)}`} className="text-primary text-xs hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-text-muted">{total} users</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 text-xs rounded bg-bg-elevated text-text-secondary disabled:opacity-30">Prev</button>
            <span className="px-2 py-1 text-xs text-text-muted">{page} / {totalPages || 1}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1 text-xs rounded bg-bg-elevated text-text-secondary disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
