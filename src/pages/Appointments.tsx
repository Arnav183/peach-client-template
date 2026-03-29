import { useEffect, useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../lib/api';

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const SC: any = { scheduled:'badge-green', requested:'badge-blue', completed:'badge-gray', cancelled:'badge-red', noshow:'badge-yellow' };

export default function Appointments() {
  const [appts, setAppts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [modal, setModal] = useState<'add'|'edit'|null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ client_id:'', client_name:'', service:'', date:'', time:'', notes:'', status:'scheduled' });

  useEffect(() => { api.appointments().then(setAppts); api.clients().then(setClients); }, []);

  function openAdd() { setForm({ client_id:'', client_name:'', service:'', date:new Date().toISOString().split('T')[0], time:'10:00 AM', notes:'', status:'scheduled' }); setModal('add'); }
  function openEdit(a: any) { setEditing(a); setForm({ client_id:a.client_id||'', client_name:a.client_name, service:a.service, date:a.date, time:a.time, notes:a.notes||'', status:a.status }); setModal('edit'); }
  function pickClient(id: string) { const c = clients.find(c => c.id===parseInt(id)); setForm(p => ({...p, client_id:id, client_name:c?.name||''})); }

  async function handleSave() {
    if (modal==='add') { const a = await api.createAppointment(form); setAppts(p=>[a,...p]); }
    else { const a = await api.updateAppointment(editing.id, form); setAppts(p=>p.map(x=>x.id===a.id?a:x)); }
    setModal(null);
  }
  async function handleDelete(id: number) { if(!confirm('Delete?')) return; await api.deleteAppointment(id); setAppts(p=>p.filter(a=>a.id!==id)); }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appts.filter(a=>a.date>=today&&a.status!=='cancelled');
  const past = appts.filter(a=>a.date<today||a.status==='cancelled'||a.status==='completed');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Calendar size={22}/> Appointments</h1><p className="text-gray-500 text-sm mt-0.5">{upcoming.length} upcoming</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16}/> New Appointment</button>
      </div>
      {[{label:'Upcoming',items:upcoming},{label:'Past / Cancelled',items:past}].map(({label,items})=>(
        <div key={label} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h2>
          <div className="card divide-y divide-gray-50">
            {items.length===0&&<p className="p-4 text-sm text-gray-400 text-center">None</p>}
            {items.map(a=>(
              <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-[10px] font-bold text-green-700">{a.date?.slice(5).replace('-','/')}</span></div>
                <div className="flex-1 min-w-0"><div className="font-medium text-sm text-gray-900">{a.client_name}</div><div className="text-xs text-gray-400">{a.service} · {a.time}</div></div>
                <span className={SC[a.status]||'badge-gray'}>{a.status}</span>
                <div className="flex gap-1">
                  <button onClick={()=>openEdit(a)} className="p-1.5 text-gray-400 hover:text-blue-500"><Edit2 size={15}/></button>
                  <button onClick={()=>handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {modal&&(
        <Modal title={modal==='add'?'New Appointment':'Edit Appointment'} onClose={()=>setModal(null)}>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Client</label>
              <select className="input" value={form.client_id} onChange={e=>pickClient(e.target.value)}>
                <option value="">Select client...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            {[['service','Service'],['date','Date'],['time','Time']].map(([f,l])=>(
              <div key={f}><label className="block text-xs font-semibold text-gray-700 mb-1">{l}</label>
              <input className="input" type={f==='date'?'date':'text'} value={(form as any)[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))}/></div>
            ))}
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                {['scheduled','requested','completed','cancelled','noshow'].map(s=><option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
            <div className="flex gap-2 pt-2"><button onClick={handleSave} className="btn-primary flex-1">Save</button><button onClick={()=>setModal(null)} className="btn-secondary flex-1">Cancel</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
