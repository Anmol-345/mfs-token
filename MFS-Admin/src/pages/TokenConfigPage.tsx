import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { TokenConfig } from '../types';

export default function TokenConfigPage() {
  const queryClient = useQueryClient();
  const [freezeInput, setFreezeInput] = useState('');
  const [newFeePercent, setNewFeePercent] = useState('');
  const [newFeeAddress, setNewFeeAddress] = useState('');

  const { data: config, isLoading, isError } = useQuery<TokenConfig>({
    queryKey: ['admin-token-config'],
    queryFn: adminService.getTokenConfig,
  });

  const { data: overview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: adminService.getAnalyticsOverview,
  });

  const updateFeeMutation = useMutation({
    mutationFn: (fee: string) => adminService.updateFee(fee),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-token-config'] }),
  });

  const updateAddressMutation = useMutation({
    mutationFn: (address: string) => adminService.updateFeeAddress(address),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-token-config'] }),
  });

  const pauseMutation = useMutation({
    mutationFn: (pause: boolean) => adminService.togglePause(pause),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-token-config'] }),
  });

  const addExemptMutation = useMutation({
    mutationFn: (address: string) => adminService.addFeeExempt(address),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-token-config'] }); setFreezeInput(''); },
  });

  const removeExemptMutation = useMutation({
    mutationFn: (address: string) => adminService.removeFeeExempt(address),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-token-config'] }),
  });

  const mfsMutation = useMutation({
    mutationFn: (data: { address: string; mfsAmount: string; ethAmount: string }) => adminService.mintTokens(data),
    onSuccess: () => alert('MFS Sent successfully!'),
    onError: (err: any) => alert('Failed: ' + (err.response?.data?.error || err.message))
  });

  const ethMutation = useMutation({
    mutationFn: (data: { address: string; mfsAmount: string; ethAmount: string }) => adminService.mintTokens(data),
    onSuccess: () => alert('0.001 ETH Sent successfully!'),
    onError: (err: any) => alert('Failed: ' + (err.response?.data?.error || err.message))
  });

  if (isLoading) {
    return <div className="animate-fadeIn space-y-6"><div className="h-8 w-56 bg-bg-elevated rounded animate-pulse" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-48 bg-bg-card border border-border rounded-xl animate-pulse" />)}</div></div>;
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Token Configuration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Basic Config */}
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-text-primary uppercase tracking-wide">Global Pause</h3>
            <button 
              onClick={() => {
                if (confirm(`Are you sure you want to ${config?.isPaused ? 'UNPAUSE' : 'PAUSE'} all token transfers?`)) {
                  pauseMutation.mutate(!config?.isPaused);
                }
              }}
              disabled={pauseMutation.isPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${config?.isPaused ? 'bg-error/20 text-error hover:bg-error/30' : 'bg-warning/20 text-warning hover:bg-warning/30'}`}
            >
              {pauseMutation.isPending ? 'Processing...' : config?.isPaused ? 'Paused' : 'Active'}
            </button>
          </div>
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-text-primary uppercase tracking-wide mb-3">Transfer Fee</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-primary">{config?.transferFee}%</span>
            </div>
            <div className="flex gap-2">
              <input value={newFeePercent} onChange={e => setNewFeePercent(e.target.value)} type="number" step="0.01" placeholder="New %" className="w-24 bg-bg border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary" />
              <button onClick={() => updateFeeMutation.mutate(newFeePercent)} disabled={!newFeePercent || updateFeeMutation.isPending} className="px-3 py-1 bg-bg-elevated hover:bg-border text-sm rounded-lg disabled:opacity-50 transition-colors">Update</button>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-text-primary uppercase tracking-wide mb-2">Fee Collection Address</h3>
            <p className="text-xs font-mono text-text-muted break-all mb-2">{config?.feeAddress}</p>
            <div className="flex gap-2">
              <input value={newFeeAddress} onChange={e => setNewFeeAddress(e.target.value)} placeholder="0x..." className="flex-1 bg-bg border border-border rounded-lg px-2 py-1 text-sm font-mono focus:outline-none focus:border-primary" />
              <button onClick={() => updateAddressMutation.mutate(newFeeAddress)} disabled={!newFeeAddress || updateAddressMutation.isPending} className="px-3 py-1 bg-bg-elevated hover:bg-border text-sm rounded-lg disabled:opacity-50 transition-colors">Save</button>
            </div>
          </div>
        </div>

        {/* Fee Exemption */}
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium text-text-primary uppercase tracking-wide">Fee Exempt Addresses</h3>
          <p className="text-xs text-text-secondary">Addresses listed here will not be charged the {config?.transferFee}% transfer fee.</p>
          <div className="flex gap-2 mt-2">
            <input value={freezeInput} onChange={e => setFreezeInput(e.target.value)} placeholder="Enter 0x address to exempt" className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary" />
            <button onClick={() => addExemptMutation.mutate(freezeInput)} disabled={!freezeInput || addExemptMutation.isPending} className="px-4 py-2 bg-primary text-black font-medium text-sm rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors">Exempt</button>
          </div>
          <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
            {(!config?.feeExemptAddresses || config.feeExemptAddresses.length === 0) ? (
              <p className="text-xs text-text-muted">No fee exempt addresses</p>
            ) : (
              config.feeExemptAddresses.map((addr) => (
                <div key={addr} className="flex justify-between items-center bg-bg-elevated rounded-lg px-3 py-1.5">
                  <span className="font-mono text-xs text-text-primary break-all mr-2">{addr}</span>
                  <button onClick={() => removeExemptMutation.mutate(addr)} disabled={removeExemptMutation.isPending} className="text-error text-xs hover:underline shrink-0">Remove</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Faucet */}
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4 lg:col-span-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-text-primary uppercase tracking-wide">Admin Faucet</h3>
              <p className="text-xs text-text-secondary mt-1">Fund user wallets with MFS tokens and Gas (ETH).</p>
            </div>
            {overview?.adminWallet && (
              <div className="text-right">
                <p className="text-xs text-text-secondary">Deployer Wallet Balance</p>
                <p className="text-sm font-bold text-primary">{overview.adminBalance} ETH</p>
                <p className="text-[10px] text-text-muted font-mono mt-0.5">{overview.adminWallet}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Target Address, Email, or Phone</label>
              <input id="faucet-address" placeholder="0x... or user@email.com" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">MFS Amount</label>
              <input id="faucet-mfs" type="number" placeholder="1000" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <button 
              onClick={() => {
                const address = (document.getElementById('faucet-address') as HTMLInputElement).value;
                const mfsAmount = (document.getElementById('faucet-mfs') as HTMLInputElement).value;
                if (!address) return alert('Enter a target address');
                if (!mfsAmount || Number(mfsAmount) <= 0) return alert('Enter a valid MFS amount');
                if (!confirm(`Are you sure you want to send ${mfsAmount} MFS to ${address}?`)) return;
                mfsMutation.mutate({ address, mfsAmount, ethAmount: '0' });
              }} 
              disabled={mfsMutation.isPending || ethMutation.isPending} 
              className="px-4 py-2 bg-primary text-black font-medium text-sm rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors flex-1"
            >
              {mfsMutation.isPending ? 'Sending...' : 'Send MFS'}
            </button>
            <button 
              onClick={() => {
                const address = (document.getElementById('faucet-address') as HTMLInputElement).value;
                if (!address) return alert('Enter a target address');
                if (!confirm(`Are you sure you want to send 0.001 ETH (Gas) to ${address}?`)) return;
                ethMutation.mutate({ address, mfsAmount: '0', ethAmount: '0.001' });
              }} 
              disabled={mfsMutation.isPending || ethMutation.isPending} 
              className="px-4 py-2 bg-bg-elevated border border-border text-text-primary font-medium text-sm rounded-lg hover:bg-border disabled:opacity-50 transition-colors flex-1"
            >
              {ethMutation.isPending ? 'Sending...' : 'Mint 0.001 ETH'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
