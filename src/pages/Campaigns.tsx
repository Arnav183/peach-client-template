import { useEffect, useState } from 'react';
import { Mail, Plus, Send, X } from 'lucide-react';
import { api } from '../lib/api';
import ServiceGate from '../components/ServiceGate';

function Modal({ title, onClose, children }: any) {
  return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"><div className="bg-white rounded-xl shadow-xl w-full max-w-lg"><div className="flex items-center justify-between px-5 py-4 border-b"><h3 className="font-semibold">{title}</h3><button onClick={onClose}><X size={18} className="text-gray-400"/></button></div><div className="p-5">{children}</div></div></div>);
}

export default function Campaigns() {
  return <ServiceGate serviceId="email_sms_marketing"><CampaignsInner /></ServiceGate>;
}
function CampaignsInner() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:'', type:'email', subject:'', body:'' });
  useEffect(() => { api.campaigns().then(setCampaigns); }, []);
  const TMPL = [
    { label:'Monthly Newsletter', subject:'Your Monthly Update', body:'Hi [Name],\n\nHere is what is new this month...\n\nThank you!\n\n[Business]' },
    { label:'Promo Blast',        subject:'Special Offer!',     body:'Hi [Name],\n\nSpecial deal this week! Mention this and save.\n\n[Business]' },
    { label:'Re-engagement',      subject:'We Miss You!',       body:'Hi [Name],\n\nIt has been a while! Book this week.\n\n[Business]' },
  ];
  async function create() { const c=await api.createCampaign(form); setCampaigns(p=>[c,...p]); setModal(false); }
  async function sendNow(id: number) { if(!confirm('Send to all active clients?')) return; const r=await api.sendCampaign(id); setCampaigns(p=>p.map(c=>c.id===id?{...c,status:'sent',sent_count:r.sent_count}:c)); }
  const ST: any = { draft:'badge-gray', sent:'badge-green', scheduled:'badge-blue' };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Mail size={22}/> Campaigns</h1><p className="text-gray-500 text-sm">Email and SMS blasts to your client list</p></div>
        <button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/> New Campaign</button>
      </div>
      <div className="card p-4 mb-6 bg-blue-50 border-blue-100"><p className="text-sm text-blue-700">Configure <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> for email and <code className="bg-blue-100 px-1 rounded">TWILIO_SID</code> for SMS.</p></div>
      <div className="card divide-y divide-gray-50">
        {campaigns.length===0&&<p className="p-6 text-center text-sm text-gray-400">No campaigns yet</p>}
        {campaigns.map(c=>(
          <div key={c.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1"><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-gray-400">{c.type.toUpperCase()}{c.subject?' · '+c.subject:''}{c.sent_count>0?' · Sent to '+c.sent_count:''}</div></div>
            <span className={ST[c.status]||'badge-gray'}>{c.status}</span>
            {c.status==='draft'&&<button onClick={()=>sendNow(c.id)} className="btn-primary text-xs flex items-center gap-1.5"><Send size={13}/> Send Now</button>}
          </div>
        ))}
      </div>
      {modal&&(
        <Modal title="New Campaign" onClose={()=>setModal(false)}>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Name</label><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Type</label><select className="input" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option value="email">Email</option><option value="sms">SMS</option></select></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Templates</label><div className="space-y-1.5">{TMPL.map(t=><button key={t.label} onClick={()=>setForm(p=>({...p,subject:t.subject,body:t.body}))} className="w-full text-xs text-left p-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50">{t.label}</button>)}</div></div>
            {form.type==='email'&&<div><label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label><input className="input" value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}/></div>}
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Body</label><textarea className="input" rows={5} value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))}/></div>
            <div className="flex gap-2 pt-2"><button onClick={create} className="btn-primary flex-1">Save Draft</button><button onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
