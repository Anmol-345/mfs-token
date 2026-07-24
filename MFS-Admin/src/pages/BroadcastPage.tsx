import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export default function BroadcastPage() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');

  const broadcastMutation = useMutation({
    mutationFn: (data: { title: string; body: string; userId?: string }) => adminService.broadcastNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-broadcast-history'] });
      setSubject('');
      setMessage('');
      setUserId('');
    },
  });

  return (
    <div className="animate-fadeIn space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Broadcast</h1>

      <form onSubmit={(e) => { e.preventDefault(); broadcastMutation.mutate({ title: subject, body: message, ...(target === 'specific' ? { userId } : {}) }); }} className="bg-bg-card border border-border rounded-xl p-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Target Audience</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary">
            <option value="all">All Users</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
            <option value="active">Active (30d)</option>
            <option value="specific">Specific User</option>
          </select>
        </div>
        {target === 'specific' && (
          <div>
            <label className="block text-sm text-text-secondary mb-1">User ID</label>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} required className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-primary" />
          </div>
        )}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Title</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary resize-none" />
        </div>
        <button type="submit" disabled={!subject.trim() || !message.trim() || broadcastMutation.isPending} className="px-6 py-2 bg-primary text-black text-sm rounded-lg hover:bg-primary-light disabled:opacity-50">
          {broadcastMutation.isPending ? 'Sending...' : broadcastMutation.isSuccess ? 'Sent!' : `Send to ${target}`}
        </button>
        {broadcastMutation.isError && <p className="text-error text-xs">{(broadcastMutation.error as any)?.response?.data?.error ?? 'Failed to send'}</p>}
      </form>

      <div className="bg-bg-card border border-border rounded-xl p-6">
        <p className="text-xs text-text-muted">Broadcast history will appear here after notifications are sent.</p>
      </div>
    </div>
  );
}
