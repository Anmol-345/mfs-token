import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { AdminUser } from '../types';

const roleOptions = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] as const;

export default function AdminsPage() {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('ADMIN');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-admins'],
    queryFn: adminService.getAdmins,
  });

  const createMutation = useMutation({
    mutationFn: (data: { email: string; name: string; role: string }) => adminService.createAdmin(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-admins'] }); setShowInvite(false); setInviteEmail(''); setInviteName(''); },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspend }: { id: string; suspend: boolean }) => adminService.suspendAdmin(id, suspend),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-admins'] }),
  });

  const admins: AdminUser[] = data?.admins ?? [];

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Admin Management</h1>
        <button onClick={() => setShowInvite(true)} className="px-4 py-2 bg-primary text-black text-sm rounded-lg hover:bg-primary-light">+ Invite</button>
      </div>

      {showInvite && (
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-medium text-text-primary">Invite New Admin</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Full Name" className="bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@mfscrypto.com" className="bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary">
              {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (inviteEmail && inviteName) createMutation.mutate({ email: inviteEmail, name: inviteName, role: inviteRole }); }} disabled={!inviteEmail || !inviteName || createMutation.isPending} className="px-4 py-2 bg-primary text-black text-sm rounded-lg hover:bg-primary-light disabled:opacity-50">Send Invite</button>
            <button onClick={() => setShowInvite(false)} className="px-4 py-2 bg-bg-elevated text-text-secondary text-sm rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" />)}</div>
          ) : isError ? (
            <div className="p-6 text-center text-error text-sm">Failed to load admins</div>
          ) : admins.length === 0 ? (
            <div className="p-6 text-center text-text-muted text-sm">No admin accounts</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase border-b border-border">
                  <th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Email</th><th className="text-center py-3 px-4">Role</th><th className="text-center py-3 px-4">Status</th><th className="text-right py-3 px-4">Created</th><th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 text-text-primary hover:bg-bg-elevated/50">
                    <td className="py-3 px-4">{a.name ?? '—'}</td>
                    <td className="py-3 px-4">{a.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.role === 'SUPER_ADMIN' ? 'bg-primary/10 text-primary' : a.role === 'ADMIN' ? 'bg-info/10 text-info' : 'bg-bg-elevated text-text-muted'}`}>{a.role}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${a.isSuspended ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>{a.isSuspended ? 'Suspended' : 'Active'}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-text-secondary text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      {a.role !== 'SUPER_ADMIN' ? (
                        <button onClick={() => suspendMutation.mutate({ id: a.id, suspend: !a.isSuspended })} disabled={suspendMutation.isPending} className={`text-xs hover:underline disabled:opacity-50 ${a.isSuspended ? 'text-success' : 'text-error'}`}>{a.isSuspended ? 'Reinstate' : 'Suspend'}</button>
                      ) : <span className="text-text-muted text-xs">—</span>}
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
