import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, FileText, Settings, Zap, Star, Mail, Image, Headphones, Globe, Search, Phone, MessageSquare, LogOut, Menu } from 'lucide-react';

const NAV = [
  { to:'/dashboard',    icon:LayoutDashboard, label:'Dashboard',   service:null },
  { to:'/clients',      icon:Users,           label:'Clients',     service:null },
  { to:'/appointments', icon:Calendar,        label:'Appointments',service:null },
  { to:'/invoices',     icon:FileText,        label:'Invoices',    service:null },
  { to:'/bookings',     icon:Calendar,        label:'Bookings',    service:'booking_calendar' },
  { to:'/reminders',    icon:Zap,             label:'Reminders',   service:'appt_reminders' },
  { to:'/reviews',      icon:Star,            label:'Reviews',     service:'review_management' },
  { to:'/followups',    icon:Zap,             label:'Follow-ups',  service:'auto_followup' },
  { to:'/campaigns',    icon:Mail,            label:'Campaigns',   service:'email_sms_marketing' },
  { to:'/social',       icon:Image,           label:'Social',      service:'social_templates' },
  { to:'/website',      icon:Globe,           label:'Website',     service:'basic_website' },
  { to:'/seo',          icon:Search,          label:'SEO',         service:'local_seo' },
  { to:'/ai-chat',      icon:MessageSquare,   label:'AI Chat',     service:'ai_chat_widget' },
  { to:'/ai-phone',     icon:Phone,           label:'AI Phone',    service:'ai_phone_agent' },
  { to:'/support',      icon:Headphones,      label:'Support',     service:'priority_support' },
  { to:'/settings',     icon:Settings,        label:'Settings',    service:null },
];

export default function Layout() {
  const { user, logout, hasService, settings } = useAuth();
  const [open, setOpen] = useState(false);
  const biz = settings?.business_name || 'My Business';
  const visible = NAV.filter(n => !n.service || hasService(n.service));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍑</span>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">{biz}</div>
            <div className="text-xs text-orange-500 font-medium">Powered by Peach Stack</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visible.map(({ to, icon: Icon, label, service }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }>
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            {service && !hasService(service) && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Locked</span>}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent />
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white z-50 flex flex-col"><SidebarContent /></aside>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)}><Menu size={22} className="text-gray-600" /></button>
          <span className="font-bold text-gray-900 text-sm">🍑 {biz}</span>
          <div className="w-6" />
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
