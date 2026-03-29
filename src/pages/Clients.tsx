import { useEffect, useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Star, Zap, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function Clients() {
  const { hasService } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add'|'edit'|null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', notes:'' });

  useEffect(() => { api.clients().then(setClients); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  function openAdd() { setForm({ name:'', email:'', phone:'', notes:'' }); setModal('add'); }
  function openEdit(c: any) { setEditing(c); setForm({ name:c.name, email:c.email||'', phone:c.phone||'', notes:c.notes||'' }); setModal('edit'); }

  async function handleSave() {
    if (modal === 'add') { const c = await api.createClient(form); setClients(p => [c,...p]); }
    else { const c = await api.updateClient(editing.id, { ...form, status: editing.status }); setClients(p => p.map(x => x.id===c.id ? c : x)); }
    setModal(null);
  }
  async function handleDelete(id: number) {
    if (!confirm('Delete this client?')) return;
    await api.deleteClient(id);
    setClients(p => p.filter(c => c.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users size={22} /> Clients</h1>
          <p className="text-gray-500 text-sm mt-0.5">{clients.length} total clients</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Client</button>
      </div>
      <div className="card mb-4">
        <div className="p-3 border-b border-gray-50">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-gray-400">No clients found</p>}
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">{c.name[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{c.name}</div>
                <div className="text-xs text-gray-400">{c.email}{c.phone ? ' · ' + c.phone : ''}</div>
              </div>
              <span className={c.status === 'active' ? 'badge-green' : 'badge-gray'}>{c.status}</span>
              <div className="flex items-center gap-1">
                {hasService('review_management') && (
                  <button onClick={() => api.requestReview(c.id, c.name)} title="Request Review" className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"><Star size={15} /></button>
                )}
                {hasService('auto_followup') && (
                  <button onClick={() => api.createFollowup({ client_id:c.id, client_name:c.name, type:'sms', message:'Hi '+c.name+'! Thanks for visiting.', scheduled_at:new Date().toISOString() })} title="Send Follow-up" className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors"><Zap size={15} /></button>
                )}
                <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modal && (
        <Modal title={modal==='add'?'Add Client':'Edit Client'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {(['name','email','phone','notes'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize">{f}</label>
                <input className="input" value={form[f]} onChange={e => setForm(p => ({ ...p, [f]:e.target.value }))} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="btn-primary flex-1">Save</button>
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
