import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { formatDate } from '../lib/utils';
import type { SupportTicket } from '../types';

const statusColors: Record<string, string> = { open: 'bg-warning/10 text-warning', in_progress: 'bg-info/10 text-info', resolved: 'bg-success/10 text-success', closed: 'bg-bg-elevated text-text-muted' };
const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

function parseMessages(raw: any): any[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return Array.isArray(raw) ? raw : [];
}

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [replying, setReplying] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Poll tickets every 4 seconds so user messages appear without needing socket
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-tickets', filter],
    queryFn: () => adminService.getTickets({ status: filter === 'all' ? undefined : filter }),
    refetchInterval: 4000,
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => adminService.replyTicket(id, body),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }); 
      setReplyBody(''); 
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => adminService.closeTicket(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }),
  });

  const tickets: SupportTicket[] = data?.tickets ?? [];
  const sorted = [...tickets].sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));

  const activeTicket = sorted.find(t => t.id === replying);
  const messages = parseMessages(activeTicket?.messages);

  // Auto-scroll to latest message when chat updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, replying]);

  return (
    <div className="animate-fadeIn space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Support Center</h1>

      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-lg text-sm capitalize ${filter === s ? 'bg-primary text-black' : 'bg-bg-elevated text-text-secondary'}`}>{s.replace('_', ' ')}</button>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" />)}</div>
          ) : isError ? (
            <div className="p-6 text-center text-error text-sm">Failed to load tickets</div>
          ) : sorted.length === 0 ? (
            <div className="p-6 text-center text-text-muted text-sm">No tickets found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase border-b border-border">
                  <th className="text-left py-3 px-4">ID</th><th className="text-left py-3 px-4">User</th><th className="text-left py-3 px-4">Subject</th><th className="text-center py-3 px-4">Priority</th><th className="text-center py-3 px-4">Status</th><th className="text-right py-3 px-4">Date</th><th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id} className={`border-b border-border/50 text-text-primary hover:bg-bg-elevated/50 cursor-pointer ${replying === t.id ? 'bg-bg-elevated/30' : ''}`}>
                    <td className="py-3 px-4 font-mono text-xs">{t.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">{t.userId?.slice(0, 8) ?? '—'}</td>
                    <td className="py-3 px-4 max-w-[200px] truncate">{t.subject}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.priority === 'high' ? 'bg-error/10 text-error' : t.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-bg-elevated text-text-muted'}`}>{t.priority}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] ?? 'bg-bg-elevated text-text-muted'}`}>{t.status.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-text-secondary text-xs">{formatDate(t.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => { setReplying(replying === t.id ? null : t.id); setReplyBody(''); }} className="text-primary text-xs hover:underline mr-2">
                        {replying === t.id ? 'Close' : 'Reply'}
                      </button>
                      {t.status !== 'resolved' && t.status !== 'closed' && (
                        <button onClick={() => closeMutation.mutate(t.id)} disabled={closeMutation.isPending} className="text-success text-xs hover:underline disabled:opacity-50">Resolve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {replying && (
          <div className="border-t border-border bg-bg-card p-4">
            {/* Chat header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">{activeTicket?.subject}</p>
                <p className="text-xs text-text-muted">
                  {messages.length} message{messages.length !== 1 ? 's' : ''} · Auto-refreshing every 4s
                </p>
              </div>
              <span className="text-xs text-text-muted animate-pulse">● LIVE</span>
            </div>

            {/* Messages */}
            <div className="mb-4 flex flex-col gap-3 max-h-72 overflow-y-auto pr-2 border border-border/30 rounded-lg p-3 bg-bg">
              {messages.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No messages yet</p>
              ) : (
                messages.map((msg: any, i: number) => {
                  const isAdmin = msg.from === 'admin';
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${isAdmin ? 'bg-primary text-black rounded-tr-none' : 'bg-bg-elevated text-text-primary rounded-tl-none'}`}>
                        <p className="text-xs font-semibold mb-1 opacity-70">{isAdmin ? 'Admin' : 'User'}</p>
                        <p>{msg.body || msg.content}</p>
                        <span className={`text-[10px] mt-1 block ${isAdmin ? 'text-black/60' : 'text-text-muted'}`}>
                          {msg.createdAt ? formatDate(msg.createdAt) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Reply input */}
            <div className="space-y-2">
              <textarea 
                value={replyBody} 
                onChange={(e) => setReplyBody(e.target.value)} 
                rows={3} 
                placeholder="Type your reply..." 
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-primary" 
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => replyMutation.mutate({ id: replying, body: replyBody })} 
                  disabled={!replyBody.trim() || replyMutation.isPending} 
                  className="px-4 py-2 bg-primary text-black text-sm rounded-lg hover:bg-primary-light disabled:opacity-50"
                >
                  {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                </button>
                <button onClick={() => { setReplying(null); setReplyBody(''); }} className="px-4 py-2 bg-bg-elevated text-text-secondary text-sm rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
