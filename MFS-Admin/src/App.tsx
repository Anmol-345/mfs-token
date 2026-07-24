import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import WalletsPage from './pages/WalletsPage';
import TransactionsPage from './pages/TransactionsPage';
import TokenConfigPage from './pages/TokenConfigPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SupportPage from './pages/SupportPage';
import AdminsPage from './pages/AdminsPage';
import BroadcastPage from './pages/BroadcastPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<ProtectedRoute minRole="SUPPORT"><DashboardPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute minRole="ADMIN"><UsersPage /></ProtectedRoute>} />
        <Route path="users/:id" element={<ProtectedRoute minRole="ADMIN"><UserDetailPage /></ProtectedRoute>} />
        <Route path="wallets" element={<ProtectedRoute minRole="ADMIN"><WalletsPage /></ProtectedRoute>} />
        <Route path="transactions" element={<ProtectedRoute minRole="ADMIN"><TransactionsPage /></ProtectedRoute>} />
        <Route path="token" element={<ProtectedRoute minRole="SUPER_ADMIN"><TokenConfigPage /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute minRole="ADMIN"><AnalyticsPage /></ProtectedRoute>} />
        <Route path="support" element={<ProtectedRoute minRole="SUPPORT"><SupportPage /></ProtectedRoute>} />
        <Route path="admins" element={<ProtectedRoute minRole="SUPER_ADMIN"><AdminsPage /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute minRole="ADMIN"><BroadcastPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
