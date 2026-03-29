import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import Invoices from './pages/Invoices';
import Bookings from './pages/Bookings';
import Reminders from './pages/Reminders';
import Reviews from './pages/Reviews';
import Followups from './pages/Followups';
import Campaigns from './pages/Campaigns';
import { Social } from './pages/Social';
import AiChat from './pages/AiChat';
import { AiPhone, Seo, Website, Support } from './pages/ServicePages';
import Settings from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><div className="text-4xl mb-3">🍑</div><div className="text-sm text-gray-400">Loading…</div></div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="clients"      element={<Clients />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="invoices"     element={<Invoices />} />
        <Route path="bookings"     element={<Bookings />} />
        <Route path="reminders"    element={<Reminders />} />
        <Route path="reviews"      element={<Reviews />} />
        <Route path="followups"    element={<Followups />} />
        <Route path="campaigns"    element={<Campaigns />} />
        <Route path="social"       element={<Social />} />
        <Route path="ai-chat"      element={<AiChat />} />
        <Route path="ai-phone"     element={<AiPhone />} />
        <Route path="seo"          element={<Seo />} />
        <Route path="website"      element={<Website />} />
        <Route path="support"      element={<Support />} />
        <Route path="settings"     element={<Settings />} />
        <Route path="*"            element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
