import { useEffect, useState } from 'react';
import { Zap, Send } from 'lucide-react';
import { api } from '../lib/api';
import ServiceGate from '../components/ServiceGate';

export default function Reminders() {
  return <ServiceGate serviceId="appt_reminders"><RemindersInner /></ServiceGate>;
}
function RemindersInner() {
  const [appts, setAppts] = useState<any[]>([]);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.reminders().then(setAppts).finally(() => setLoading(false)); }, []);
  async function send(id: number) { await api.sendReminder(id); setSent(p => new Set([...p, id])); }
  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Zap size={22}/> Appointment Reminders</h1><p className="text-gray-500 text-sm">Upcoming appointments in the next 3 days</p></div>
        {appts.length>0&&<button onClick={()=>appts.forEach(a=>!sent.has(a.id)&&send(a.id))} className="btn-primary flex items-center gap-2"><Send size={15}/> Send All</button>}
      </div>
      <div className="card p-4 mb-6 bg-blue-50 border-blue-100">
        <p className="text-sm text-blue-700">Configure <code className="bg-blue-100 px-1 rounded">TWILIO_SID</code> and <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> to activate real sends.</p>
      </div>
      <div className="card divide-y divide-gray-50">
        {appts.length===0&&<p className="p-6 text-center text-sm text-gray-400">No upcoming appointments in the next 3 days</p>}
        {appts.map(a=>(
          <div key={a.id} className="flex items-center gap-4 px-5 py-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-[10px] font-bold text-orange-600">{a.date?.slice(5).replace('-','/')}</span></div>
            <div className="flex-1"><div className="font-medium text-sm text-gray-900">{a.client_name}</div><div className="text-xs text-gray-400">{a.service} · {a.time}</div></div>
            {sent.has(a.id)?<span className="badge-green">Sent ✓</span>:<button onClick={()=>send(a.id)} className="btn-primary text-xs flex items-center gap-1.5"><Send size={13}/> Send</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
