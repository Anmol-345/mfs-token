import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { formatNumber } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import type { AnalyticsOverview, ChartDataPoint } from '../types';

const COLORS = ['#7B61FF', '#00D4AA', '#FF8C42', '#FF5C5C'];

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');

  const { data: overview } = useQuery<AnalyticsOverview>({
    queryKey: ['admin-overview'],
    queryFn: adminService.getAnalyticsOverview,
  });

  const { data: charts, isLoading } = useQuery<{
    transactionVolume: ChartDataPoint[];
    userGrowth: ChartDataPoint[];
    feeRevenue: ChartDataPoint[];
    distribution: { name: string; value: number }[];
    quickStats: { label: string; value: string }[];
  }>({
    queryKey: ['admin-charts', range],
    queryFn: () => adminService.getAnalyticsCharts(range),
  });

  const ranges = [
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '1y', value: '1y' },
  ];

  const volume = charts?.transactionVolume ?? [];
  const growth = charts?.userGrowth ?? [];
  const fees = charts?.feeRevenue ?? [];
  const distribution = charts?.distribution ?? [];
  const quickStats = charts?.quickStats ?? [];

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <div className="flex gap-1 bg-bg-card border border-border rounded-lg p-1">
          {ranges.map((r) => (
            <button key={r.value} onClick={() => setRange(r.value)} className={`px-3 py-1.5 text-xs rounded-md ${range === r.value ? 'bg-primary text-black' : 'text-text-secondary hover:text-text-primary'}`}>{r.label}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-64 bg-bg-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs text-text-muted uppercase tracking-wide mb-4">Transaction Volume</h3>
              {volume.length === 0 ? <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={volume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                    <XAxis dataKey="date" stroke="#6B6B80" fontSize={11} />
                    <YAxis stroke="#6B6B80" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3E', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="value" fill="#7B61FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs text-text-muted uppercase tracking-wide mb-4">Fee Collection</h3>
              {fees.length === 0 ? <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={fees}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                    <XAxis dataKey="date" stroke="#6B6B80" fontSize={11} />
                    <YAxis stroke="#6B6B80" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3E', borderRadius: 8, color: '#fff' }} />
                    <Line type="monotone" dataKey="value" stroke="#00D4AA" strokeWidth={2} dot={{ fill: '#00D4AA' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs text-text-muted uppercase tracking-wide mb-4">User Growth</h3>
              {growth.length === 0 ? <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data</div> : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={growth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                    <XAxis dataKey="date" stroke="#6B6B80" fontSize={11} />
                    <YAxis stroke="#6B6B80" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3E', borderRadius: 8, color: '#fff' }} />
                    <Area type="monotone" dataKey="value" stroke="#FF8C42" fill="#FF8C42" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs text-text-muted uppercase tracking-wide mb-4">Transaction Distribution</h3>
              {distribution.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-text-muted text-sm">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {distribution.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3E', borderRadius: 8, color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 text-xs text-text-secondary mt-2 flex-wrap">
                    {distribution.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{d.name}</div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-xs text-text-muted uppercase tracking-wide">Quick Stats</h3>
              {overview ? (
                <>
                  <div className="flex justify-between text-sm border-b border-border/50 pb-2"><span className="text-text-secondary">Total Users</span><span className="text-text-primary font-medium">{overview.totalUsers.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm border-b border-border/50 pb-2"><span className="text-text-secondary">Total Wallets</span><span className="text-text-primary font-medium">{overview.totalWallets.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm border-b border-border/50 pb-2"><span className="text-text-secondary">Circulating Supply</span><span className="text-text-primary font-medium">{formatNumber(overview.circulatingSupply)} MFS</span></div>
                  <div className="flex justify-between text-sm border-b border-border/50 pb-2"><span className="text-text-secondary">Fee Revenue (30d)</span><span className="text-text-primary font-medium">{formatNumber(overview.feeRevenue30d)} MFS</span></div>
                  <div className="flex justify-between text-sm border-b border-border/50 pb-2"><span className="text-text-secondary">Total TXs</span><span className="text-text-primary font-medium">{overview.totalTransactions.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Users Today</span><span className="text-text-primary font-medium">{overview.usersToday.toLocaleString()}</span></div>
                </>
              ) : (
                quickStats.length > 0 ? quickStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm border-b border-border/50 pb-2">
                    <span className="text-text-secondary">{s.label}</span><span className="text-text-primary font-medium">{s.value}</span>
                  </div>
                )) : <div className="py-4 text-center text-text-muted text-sm">No stats available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
