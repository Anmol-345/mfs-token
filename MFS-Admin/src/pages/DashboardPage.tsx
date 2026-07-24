import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { formatNumber } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import type { ChartDataPoint, AnalyticsOverview } from '../types';

export default function DashboardPage() {
  const { data: overview, isLoading: ovLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['admin-overview'],
    queryFn: adminService.getAnalyticsOverview,
  });

  const { data: charts } = useQuery<{ transactionVolume: ChartDataPoint[]; userGrowth: ChartDataPoint[] }>({
    queryKey: ['admin-charts', '30d'],
    queryFn: () => adminService.getAnalyticsCharts('30d'),
  });

  const { data: recentTxs, isLoading: txLoading } = useQuery({
    queryKey: ['admin-recent-txs'],
    queryFn: () => adminService.getTransactions({ limit: 5, page: 1 }),
  });

  const kpis = [
    { label: 'Total Users', value: overview?.totalUsers ?? 0, prefix: '' },
    { label: 'Total Wallets', value: overview?.totalWallets ?? 0, prefix: '' },
    { label: 'Circulating Supply', value: overview?.circulatingSupply ?? '0', prefix: '' },
    { label: '30d Fee Revenue', value: overview?.feeRevenue30d ?? '0', prefix: '' },
    { label: 'Total Transactions', value: overview?.totalTransactions ?? 0, prefix: '' },
    { label: 'Users Today', value: overview?.usersToday ?? 0, prefix: '' },
  ];

  const transactions = recentTxs?.transactions ?? [];
  const txVolume = charts?.transactionVolume ?? [];
  const userGrowth = charts?.userGrowth ?? [];

  return (
    <div className="animate-fadeIn space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      
      {!ovLoading && overview?.adminWallet && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-primary mb-1">Master Admin Wallet (Deployer)</h3>
            <p className="text-xs text-text-muted font-mono">{overview.adminWallet}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-text-muted uppercase tracking-wide">Available Gas (Base Sepolia)</p>
            <p className="text-xl font-bold text-primary mt-1">{overview.adminBalance} ETH</p>
          </div>
        </div>
      )}

      {ovLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-4 animate-pulse"><div className="h-3 w-20 bg-bg-elevated rounded mb-2" /><div className="h-6 w-16 bg-bg-elevated rounded" /></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted uppercase tracking-wide">{kpi.label}</p>
              <p className="text-xl font-bold text-text-primary mt-1">{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : formatNumber(kpi.value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-text-primary mb-4">Transaction Volume</h3>
          {txVolume.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={txVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                <XAxis dataKey="date" stroke="#6B6B80" fontSize={12} />
                <YAxis stroke="#6B6B80" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3E', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="value" fill="#7B61FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-text-primary mb-4">User Growth</h3>
          {userGrowth.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                <XAxis dataKey="date" stroke="#6B6B80" fontSize={12} />
                <YAxis stroke="#6B6B80" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3E', borderRadius: 8, color: '#fff' }} />
                <Area type="monotone" dataKey="value" stroke="#00D4AA" fill="#00D4AA" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">Recent Transactions</h3>
        {txLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-sm">No recent transactions</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase border-b border-border">
                  <th className="text-left py-3 px-2">TX Hash</th><th className="text-left py-3 px-2">User</th><th className="text-right py-3 px-2">Amount</th><th className="text-center py-3 px-2">Status</th><th className="text-right py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-border/50 text-text-primary">
                    <td className="py-3 px-2 font-mono text-xs">{(tx.txHash ?? tx.id).slice(0, 14)}...</td>
                    <td className="py-3 px-2">{tx.userId?.slice(0, 8) ?? '—'}</td>
                    <td className="py-3 px-2 text-right">{formatNumber(tx.amount)} MFS</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'confirmed' ? 'bg-success/10 text-success' : tx.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>{tx.status}</span>
                    </td>
                    <td className="py-3 px-2 text-right text-text-secondary text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
