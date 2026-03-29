import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

interface User { id: number; name: string; email: string; role: string; }
interface ServicesData { active: string[]; activeServices: any[]; }
interface AuthCtx {
  user: User | null; loading: boolean; services: ServicesData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasService: (id: string) => boolean;
  settings: Record<string, string>;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServicesData | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    Promise.all([api.me(), api.services(), api.settings()])
      .then(([me, svcs, sets]) => { setUser(me); setServices(svcs); setSettings(sets); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    const [svcs, sets] = await Promise.all([api.services(), api.settings()]);
    setServices(svcs); setSettings(sets);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null); setServices(null);
    window.location.href = '/login';
  }

  function hasService(id: string) {
    if (id === 'crm_dashboard') return true;
    return services?.active.includes(id) ?? false;
  }

  return (
    <AuthContext.Provider value={{ user, loading, services, login, logout, hasService, settings }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
