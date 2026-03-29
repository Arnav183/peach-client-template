import { useEffect, useState } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import ServiceGate from '../components/ServiceGate';

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

export default function Bookings() {
  return <ServiceGate serviceId="booking_calendar"><BookingsInner /></ServiceGate>;
}

function BookingsInner() {
  const [slots, setSlots] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date:'', time:'', duration_min:'60' });

  useEffect(() => {
    api.bookingSlots().then(setSlots);
    api.appointments().then((all: any[]) => setRequests(all.filter(a => a.status==='requested')));
  }, []);

  async function addSlot() { const s = await api.createSlot(form); setSlots(p=>[...p,s]); setModal(false); }
  async function approve(appt: any) { await api.updateAppointment(appt.id, {...appt, status:'scheduled'}); setRequests(p=>p.filter(r=>r.id!==appt.id)); }
  const bookingUrl = window.location.origin + '/book';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CalendarDays size={22}/> Bookings</h1><p className="text-gray-500 text-sm">Manage availability and incoming requests</p></div>
        <button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Slot</button>
      </div>
      <div className="card p-4 mb-6 flex items-center gap-4 bg-orange-50 border-orange-100">
        <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-orange-700 mb-0.5">Your Booking Link</div><div className="text-sm text-orange-600 truncate font-mono">{bookingUrl}</div></div>
        <button onClick={()=>navigator.clipboard.writeText(bookingUrl)} className="btn-secondary text-xs whitespace-nowrap">Copy Link</button>
      </div>
      {requests.length>0&&(
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Pending Requests ({requests.length})</h2>
          <div className="card divide-y divide-gray-50">
            {requests.map(r=>(
              <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1"><div className="font-medium text-sm">{r.client_name}</div><div className="text-xs text-gray-400">{r.service} · {r.date} {r.time}</div></div>
                <button onClick={()=>approve(r)} className="btn-primary text-xs">Approve</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Available Slots</h2>
      <div className="card divide-y divide-gray-50">
        {slots.length===0&&<p className="p-4 text-sm text-gray-400 text-center">No slots yet</p>}
        {slots.map(s=>(
          <div key={s.id} className="flex items-center gap-4 px-5 py-3">
            <div className="flex-1"><div className="font-medium text-sm">{s.date} at {s.time}</div><div className="text-xs text-gray-400">{s.duration_min} min</div></div>
            <span className={s.is_blocked?'badge-red':s.appointment_id?'badge-yellow':'badge-green'}>{s.is_blocked?'Blocked':s.appointment_id?'Booked':'Open'}</span>
          </div>
        ))}
      </div>
      {modal&&(
        <Modal title="Add Available Slot" onClose={()=>setModal(false)}>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Date</label><input type="date" className="input" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Time</label><input type="text" className="input" placeholder="e.g. 10:00 AM" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))}/></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
              <select className="input" value={form.duration_min} onChange={e=>setForm(p=>({...p,duration_min:e.target.value}))}>
                {['30','45','60','90','120'].map(d=><option key={d} value={d}>{d} min</option>)}
              </select></div>
            <div className="flex gap-2 pt-2"><button onClick={addSlot} className="btn-primary flex-1">Add</button><button onClick={()=>setModal(false)} className="btn-secondary flex-1">Cancel</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
