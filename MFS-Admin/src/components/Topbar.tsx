import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

export default function Topbar() {
  const queryClient = useQueryClient();
  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);
  const toggle = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="h-16 border-b border-border bg-bg-secondary flex items-center justify-between px-4 lg:px-6">
      <button onClick={toggle} className="lg:hidden text-text-secondary hover:text-text-primary text-xl p-1">☰</button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <button 
          onClick={() => queryClient.invalidateQueries()} 
          className="p-1.5 rounded bg-bg-elevated text-text-secondary hover:text-primary transition-colors text-sm"
          title="Refresh Data"
        >
          ⟳ Refresh
        </button>
        <span className="text-sm text-text-secondary">{admin?.name || admin?.email}</span>
        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">{admin?.role}</span>
        <button onClick={logout} className="text-sm text-text-muted hover:text-error transition-colors">Logout</button>
      </div>
    </header>
  );
}
