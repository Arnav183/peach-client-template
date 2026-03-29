import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, FileText, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { settings, hasService } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.dashboard().then(setData).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  const stats = [
    { label:'Total Clients',    value:data?.totalClients ?? 0,               icon:Users,       color:'bg-blue-50 text-blue-600',    link:'/clients' },
    { label:"Today's Appts",    value:data?.todayAppts ?? 0,                 icon:Calendar,    color:'bg-green-50 text-green-600',  link:'/appointments' },
    { label:'Pending Invoices', value:data?.pendingInvoices ?? 0,            icon:FileText,    color:'bg-yellow-50 text-yellow-600',link:'/invoices' },
    { label:'Revenue',          value:'$'+(data?.revenue ?? 0).toFixed(2),   icon:DollarSign,  color:'bg-orange-50 text-orange-600',link:'/invoices' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Good morning 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">{settings?.business_name} · Here is your overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link to={s.link} key={s.label} className="card p-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}><s.icon size={20} /></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Upcoming</h2>
            <Link to="/appointments" className="text-xs text-orange-500 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {data?.upcomingAppts?.length ? (
            <div className="space-y-2">
              {data.upcomingAppts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><div className="text-sm font-medium text-gray-800">{a.client_name}</div><div className="text-xs text-gray-400">{a.service} · {a.date} {a.time}</div></div>
                  <span className="badge-green">{a.status}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No upcoming appointments</p>}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Users size={16} className="text-orange-500" /> Recent Clients</h2>
            <Link to="/clients" className="text-xs text-orange-500 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {data?.recentClients?.length ? (
            <div className="space-y-2">
              {data.recentClients.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">{c.name[0].toUpperCase()}</div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium text-gray-800 truncate">{c.name}</div><div className="text-xs text-gray-400 truncate">{c.email}</div></div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No clients yet</p>}
        </div>
      </div>
      {hasService('priority_support') && (
        <div className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-white flex items-center justify-between">
          <div><div className="font-semibold text-sm">🎧 Priority Support Active</div><div className="text-xs opacity-80">Same-day response guaranteed.</div></div>
          <a href="mailto:hello@peachstack.dev" className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Contact Us</a>
        </div>
      )}
    </div>
  );
}
