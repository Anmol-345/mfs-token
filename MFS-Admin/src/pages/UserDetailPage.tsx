import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { formatDate, formatNumber } from '../lib/utils';
import type { AppUser, Transaction } from '../types';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'transactions' | 'referrals'>('profile');

  const { data: user, isLoading: userLoading } = useQuery<AppUser>({
    queryKey: ['admin-user', id],
    queryFn: () => adminService.getUser(id!),
    enabled: !!id,
  });

  const { data: txsData, isLoading: txsLoading } = useQuery({
    queryKey: ['admin-user-txs', id],
    queryFn: () => adminService.getTransactions({ userId: id, limit: 20 }),
    enabled: !!id,
  });

  const freezeMutation = useMutation({
    mutationFn: (freeze: boolean) => adminService.freezeUser(id!, freeze),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-user', id] }); },
  });

  const updateKycMutation = useMutation({
    mutationFn: (status: string) => adminService.updateKyc(id!, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-user', id] }); },
  });

  const fundGasMutation = useMutation({
    mutationFn: () => adminService.fundGas(id!),
    onSuccess: () => { 
      alert('Successfully minted 0.001 ETH!');
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] }); 
    },
    onError: (err: any) => {
      alert(`Failed to mint ETH: ${err.message}`);
    }
  });

  const txs: Transaction[] = txsData?.transactions ?? [];

  if (userLoading) {
    return (
      <div className="animate-fadeIn space-y-4">
        <div className="h-8 w-48 bg-bg-elevated rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-bg-card border border-border rounded-xl p-6 space-y-4"><div className="w-16 h-16 rounded-full bg-bg-elevated animate-pulse" />{[1,2,3,4].map(i => <div key={i} className="h-5 bg-bg-elevated rounded animate-pulse" />)}</div>
          <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) return <div className="text-center py-12 text-text-muted text-sm">User not found</div>;

  return (
    <div className="animate-fadeIn space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">User Detail</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl text-primary font-bold">{user.email?.[0]?.toUpperCase() ?? 'U'}</div>
          <div><p className="text-sm text-text-muted">Email</p><p className="text-text-primary">{user.email ?? '—'}</p></div>
          <div><p className="text-sm text-text-muted">Phone</p><p className="text-text-primary">{user.phone ?? '—'}</p></div>
          <div><p className="text-sm text-text-muted">KYC Level</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.kycLevel === 'advanced' ? 'bg-success/10 text-success' : user.kycLevel === 'basic' ? 'bg-warning/10 text-warning' : 'bg-bg-elevated text-text-muted'}`}>{user.kycLevel}</span></div>
          <div><p className="text-sm text-text-muted">Status</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{user.status}</span></div>
          <div><p className="text-sm text-text-muted">Referral Code</p><p className="text-text-primary font-mono text-sm">{user.referralCode ?? '—'}</p></div>
          <div><p className="text-sm text-text-muted">Wallet Address</p><p className="text-text-primary font-mono text-xs break-all">{(user.walletAddress ?? user.mfsAddress) ?? '—'}</p></div>
          <div><p className="text-sm text-text-muted">Joined</p><p className="text-text-primary text-sm">{formatDate(user.createdAt)}</p></div>
          <div className="flex gap-2 pt-2 items-center flex-wrap">
            <select
              value={user.kycLevel}
              onChange={(e) => updateKycMutation.mutate(e.target.value)}
              disabled={updateKycMutation.isPending}
              className="bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none"
            >
              <option value="unverified">Force Unverified</option>
              <option value="basic">Force Basic KYC</option>
              <option value="advanced">Force Advanced KYC</option>
            </select>
            <button onClick={() => freezeMutation.mutate(user.status !== 'suspended')} disabled={freezeMutation.isPending} className="px-4 py-2 bg-error/10 text-error text-sm rounded-lg hover:bg-error/20 disabled:opacity-50">
              {user.status === 'suspended' ? 'Unfreeze' : 'Freeze'}
            </button>
            <button className="px-4 py-2 bg-warning/10 text-warning text-sm rounded-lg hover:bg-warning/20">Reset Password</button>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to mint 0.001 Sepolia ETH to this user?')) {
                  fundGasMutation.mutate();
                }
              }}
              disabled={fundGasMutation.isPending}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {fundGasMutation.isPending ? 'Minting...' : 'Mint 0.001 ETH'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl">
          <div className="flex border-b border-border">
            {(['profile', 'transactions', 'referrals'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium capitalize ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-text-muted'}`}>{t}</button>
            ))}
          </div>
          <div className="p-6">
            {tab === 'transactions' && (
              txsLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" />)}</div>
              ) : txs.length === 0 ? (
                <div className="py-8 text-center text-text-muted text-sm">No transactions</div>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="text-text-muted text-xs uppercase border-b border-border"><th className="text-left py-2">Type</th><th className="text-right py-2">Amount</th><th className="text-center py-2">Status</th><th className="text-right py-2">Date</th></tr></thead>
                  <tbody>
                    {txs.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 text-text-primary">
                        <td className="py-3 capitalize">{tx.type}</td>
                        <td className="py-3 text-right">{formatNumber(tx.amount)} MFS</td>
                        <td className="py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${tx.status === 'confirmed' ? 'bg-success/10 text-success' : tx.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>{tx.status}</span></td>
                        <td className="py-3 text-right text-text-secondary text-xs">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
            {tab === 'profile' && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-text-muted">User ID</p><p className="text-text-primary font-mono text-xs">{user.id}</p></div>
                <div><p className="text-text-muted">Referred By</p><p className="text-text-primary">{(user as any).referralsReceived?.[0]?.referrer?.email || user.referredBy || 'None'}</p></div>
              </div>
            )}
            {tab === 'referrals' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Users Referred By This Account ({(user as any).referralsMade?.length || 0})</h3>
                {(user as any).referralsMade?.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead><tr className="text-text-muted text-xs uppercase border-b border-border"><th className="text-left py-2">User Email/Phone</th><th className="text-right py-2">Joined</th></tr></thead>
                    <tbody>
                      {(user as any).referralsMade.map((r: any) => (
                        <tr key={r.id} className="border-b border-border/50 text-text-primary">
                          <td className="py-3">{r.referred?.email || r.referred?.phone || 'Unknown'}</td>
                          <td className="py-3 text-right text-text-secondary">{formatDate(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-text-muted text-sm py-4">No referrals made yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
