import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@mfscrypto.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminService.login({ email, password });
      setAuth(data.admin, data.accessToken, data.refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-primary tracking-widest">MFS</h1>
          <p className="text-text-secondary mt-2">Admin Control Panel</p>
        </div>
        <form onSubmit={handleLogin} className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Sign In</h2>
          {error && <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg px-4 py-2">{error}</div>}
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-primary" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-black rounded-lg py-2.5 text-sm font-medium hover:bg-primary-light disabled:opacity-50 transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
