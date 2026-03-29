import { useEffect, useState } from 'react';
import { Zap, Plus, Send, X } from 'lucide-react';
import { api } from '../lib/api';
import ServiceGate from '../components/ServiceGate';

function Modal({ title, onClose, children }: any) {
  return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"><div className="bg-white rounded-xl shadow-xl w-full max-w-md"><div className="flex items-center justify-between px-5 py-4 border-b"><h3 className="font-semibold text-gray-900">{title}</h3><button onClick={onClose}><X size={18} className="text-gray-400"/></button></div><div className="p-5">{children}</div></div></div>);
}

export default function Followups() {
  return <ServiceGate serviceId="auto_followup"><FollowupsInner /></ServiceGate>;
}
function FollowupsInner() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ client_id:'', client_name:'', type:'sms', message:'', scheduled_at:'' });
  useEffect(() => { api.followups().then(setFollowups); api.clients().then(setClients); }, []);
  const TMPL = [
    { label:'Post-visit thank you', msg:'Hi {n}! Thanks for visiting. Hope to see you soon!' },
    { label:'Rebook reminder',      msg:"Hi {n}! It's been a while — ready to book your next appointment?" },
    { label:'Review request',       msg:'Hi {n}! Could you leave us a quick Google review? It means a lot!' },
    { label:'Promo blast',          msg:'Hi {n}! Special deal this week. Reply for details!' },
  ];
  function pick(id: string) { const c=clients.find(c=>c.id===parseInt(id)); setForm(p=>({...p,client_id:id,client_name:c?.name||''})); }
  async function create() { const f=await api.createFollowup({...form,scheduled_at:form.scheduled_at||new Date().toISOString()}); setFollowups(p=>[f,...p]); setModal(false); }
  async function send(id: number) { await api.sendFollowup(id); setFollowups(p=>p.map(f=>f.id===id?{...f,status:'sent'}:f)); }
  const ST: any = { pending:'badge-yellow', sent:'badge-green', failed:'badge-red' };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Zap size={22}/> Auto Follow-ups</h1><p className="text-gray-500 text-sm">Automated messages to keep clients engaged</p></div>
        <button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/> New Follow-up</button>
      </div>
      <div className="card p-4 mb-6 bg-blue-50 border-blue-100"><p className="text-sm text-blue-700">Configure <code className="bg-blue-100 px-1 rounded">TWILIO_SID</code> + <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> to activate real sends.</p></div>
      <div className="card divide-y divide-gray-50">
        {followups.length===0&&<p className="p-6 text-center text-sm text-gray-400">No follow-ups yet</p>}
        {followups.map(f=>(
          <div key={f.id} className="flex items-center gap-4 px-5 py-3">
            <div className="flex-1 min-w-0"><div className="font-medium text-sm">{f.client_name}</div><div className="text-xs text-gray-400 truncate">{f.type.toUpperCase()} · {f.message}</div></div>
            <span className={ST[f.status]||'badge-gray'}>{f.status}</span>
            {f.status==='pending'&&<button onClick={()=>send(f.id)} className="btn-primary text-xs flex items-center gap-1"><Send size={12}/> Send</button>}
          </div>
        ))}
      </div>
      {modal&&(
        <Modal title="New Follow-up" onClose={()=>setModal(false)}>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Client</label>
              <select className="input" value={form.client_id} onChange={e=>pick(e.target.value)}>
                <option value="">Select client...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
              <select className="input" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                <option value="sms">SMS</option><option value="email">Email</option></select></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Templates</label>
              <div className="grid grid-cols-2 gap-1.5">{TMPL.map(t=><button key={t.label} onClick={()=>setForm(p=>({...p,message:t.msg.replace('{n}',p.client_name||'{name}')}))} className="text-xs text-left p-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50">{t.label}</button>)}</div></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Message</label><textarea className="input" rows={3} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}/></div>
            <div className="flex gap-2 pt-2"><button onClick={create} className="btn-primary flex-1">Create</button><button onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
