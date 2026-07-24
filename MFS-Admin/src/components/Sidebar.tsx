import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

const navItems = [
  { label: 'Dashboard', path: '/', icon: '◇', roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { label: 'Users', path: '/users', icon: '◎', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Wallets', path: '/wallets', icon: '◈', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Transactions', path: '/transactions', icon: '⇄', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Token Config', path: '/token', icon: '⚙', roles: ['SUPER_ADMIN'] },
  { label: 'Analytics', path: '/analytics', icon: '◉', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Support', path: '/support', icon: '?', roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
  { label: 'Admins', path: '/admins', icon: '⊚', roles: ['SUPER_ADMIN'] },
  { label: 'Broadcast', path: '/notifications', icon: '☰', roles: ['SUPER_ADMIN', 'ADMIN'] },
];

export default function Sidebar() {
  const admin = useAuthStore((s) => s.admin);
  const open = useUIStore((s) => s.sidebarOpen);
  const toggle = useUIStore((s) => s.toggleSidebar);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={toggle} />}
      <aside className={`fixed top-0 left-0 z-30 h-full bg-bg-secondary border-r border-border transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-0 w-60`}>
        <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
          <span className="text-2xl font-extrabold text-primary tracking-widest">MFS</span>
          <span className="text-xs text-text-muted uppercase">Admin</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            if (admin && !item.roles.includes(admin.role)) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => { if (window.innerWidth < 1024) toggle(); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'}`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
