import { useEffect, useState } from 'react';
import { FileText, Plus, Edit2, Trash2, X, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400"/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [modal, setModal] = useState<'add'|'edit'|null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ client_id:'', client_name:'', amount:'', description:'', due_date:'', status:'pending', paid_date:'' });

  useEffect(() => { api.invoices().then(setInvoices); api.clients().then(setClients); }, []);

  const totalPaid = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.amount),0);
  const totalPending = invoices.filter(i=>i.status==='pending').reduce((s,i)=>s+Number(i.amount),0);

  function openAdd() { setForm({ client_id:'', client_name:'', amount:'', description:'', due_date:'', status:'pending', paid_date:'' }); setModal('add'); }
  function openEdit(inv: any) { setEditing(inv); setForm({ client_id:inv.client_id||'', client_name:inv.client_name, amount:inv.amount, description:inv.description||'', due_date:inv.due_date||'', status:inv.status, paid_date:inv.paid_date||'' }); setModal('edit'); }
  function pickClient(id: string) { const c = clients.find(c=>c.id===parseInt(id)); setForm(p=>({...p, client_id:id, client_name:c?.name||''})); }
  async function handleSave() {
    if (modal==='add') { const i = await api.createInvoice(form); setInvoices(p=>[i,...p]); }
    else { const i = await api.updateInvoice(editing.id, form); setInvoices(p=>p.map(x=>x.id===i.id?i:x)); }
    setModal(null);
  }
  async function markPaid(inv: any) { const u = await api.updateInvoice(inv.id, {...inv, status:'paid', paid_date:new Date().toISOString().split('T')[0]}); setInvoices(p=>p.map(x=>x.id===u.id?u:x)); }
  async function handleDelete(id: number) { if(!confirm('Delete?')) return; await api.deleteInvoice(id); setInvoices(p=>p.filter(i=>i.id!==id)); }

  const ST: any = { paid:'badge-green', pending:'badge-yellow', overdue:'badge-red' };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText size={22}/> Invoices</h1><p className="text-gray-500 text-sm">{invoices.length} total</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16}/> New Invoice</button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4"><div className="text-xs text-gray-500 mb-1">Collected</div><div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div></div>
        <div className="card p-4"><div className="text-xs text-gray-500 mb-1">Outstanding</div><div className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</div></div>
      </div>
      <div className="card divide-y divide-gray-50">
        {invoices.length===0&&<p className="p-6 text-center text-sm text-gray-400">No invoices yet</p>}
        {invoices.map(inv=>(
          <div key={inv.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
            <div className="flex-1 min-w-0"><div className="font-medium text-sm text-gray-900">{inv.client_name}</div><div className="text-xs text-gray-400">{inv.description||'Invoice'}{inv.due_date?' · Due '+inv.due_date:''}</div></div>
            <div className="font-semibold">${Number(inv.amount).toFixed(2)}</div>
            <span className={ST[inv.status]||'badge-gray'}>{inv.status}</span>
            <div className="flex gap-1">
              {inv.status!=='paid'&&<button onClick={()=>markPaid(inv)} className="p-1.5 text-gray-400 hover:text-green-500"><CheckCircle size={15}/></button>}
              <button onClick={()=>openEdit(inv)} className="p-1.5 text-gray-400 hover:text-blue-500"><Edit2 size={15}/></button>
              <button onClick={()=>handleDelete(inv.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={15}/></button>
            </div>
          </div>
        ))}
      </div>
      {modal&&(
        <Modal title={modal==='add'?'New Invoice':'Edit Invoice'} onClose={()=>setModal(null)}>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Client</label>
              <select className="input" value={form.client_id} onChange={e=>pickClient(e.target.value)}>
                <option value="">Select client...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            {([['amount','Amount'],['description','Description'],['due_date','Due Date']] as const).map(([f,l])=>(
              <div key={f}><label className="block text-xs font-semibold text-gray-700 mb-1">{l}</label>
              <input className="input" type={f==='due_date'?'date':f==='amount'?'number':'text'} value={(form as any)[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))}/></div>
            ))}
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                {['pending','paid','overdue'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
            <div className="flex gap-2 pt-2"><button onClick={handleSave} className="btn-primary flex-1">Save</button><button onClick={()=>setModal(null)} className="btn-secondary flex-1">Cancel</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
