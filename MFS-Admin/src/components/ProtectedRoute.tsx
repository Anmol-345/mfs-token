import { useAuthStore } from '../stores/authStore';

const roleHierarchy: Record<string, number> = {
  SUPER_ADMIN: 3, ADMIN: 2, SUPPORT: 1,
};

export default function ProtectedRoute({ children, minRole = 'SUPPORT' }: { children: React.ReactNode; minRole?: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const admin = useAuthStore((s) => s.admin);

  if (!isAuthenticated || !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Access Denied</h1>
          <a href="/login" className="text-primary hover:underline">Login</a>
        </div>
      </div>
    );
  }

  const userLevel = roleHierarchy[admin.role] || 0;
  const requiredLevel = roleHierarchy[minRole] || 0;

  if (userLevel < requiredLevel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Insufficient Permissions</h1>
          <p className="text-text-secondary">Your role does not have access to this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
