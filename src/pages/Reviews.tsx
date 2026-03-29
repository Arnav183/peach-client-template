import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { api } from '../lib/api';
import ServiceGate from '../components/ServiceGate';

export default function Reviews() {
  return <ServiceGate serviceId="review_management"><ReviewsInner /></ServiceGate>;
}
function ReviewsInner() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [requested, setRequested] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([api.reviews(), api.clients()]).then(([r,c])=>{setReviews(r);setClients(c);}).finally(()=>setLoading(false)); }, []);
  async function req(c: any) { await api.requestReview(c.id, c.name); setRequested(p=>new Set([...p,c.id])); }
  const avg = reviews.filter(r=>r.rating).reduce((s,r,_,a)=>s+r.rating/a.length,0);
  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Star size={22}/> Review Management</h1><p className="text-gray-500 text-sm">Auto-request reviews and monitor your reputation</p></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{avg?avg.toFixed(1):'–'}</div><div className="text-xs text-gray-500">Avg Rating</div></div>
        <div className="card p-4 text-center"><div className="text-2xl font-bold text-gray-900">{reviews.length}</div><div className="text-xs text-gray-500">Total Reviews</div></div>
        <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-600">{reviews.filter(r=>r.rating>=4).length}</div><div className="text-xs text-gray-500">4-5 Star</div></div>
      </div>
      <div className="card p-4 mb-6 bg-blue-50 border-blue-100"><p className="text-sm text-blue-700">Configure <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> to send real review request emails.</p></div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Request Reviews</h2>
          <div className="card divide-y divide-gray-50">
            {clients.map(c=>(
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">{c.name[0]}</div>
                <div className="flex-1 text-sm font-medium">{c.name}</div>
                {requested.has(c.id)?<span className="badge-green text-xs">Requested ✓</span>:<button onClick={()=>req(c)} className="btn-secondary text-xs">Request</button>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Recent Reviews</h2>
          <div className="card divide-y divide-gray-50">
            {reviews.length===0&&<p className="p-4 text-sm text-gray-400 text-center">No reviews yet</p>}
            {reviews.map(r=>(
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{r.client_name}</span><span className="text-yellow-400">{'★'.repeat(r.rating||0)}{'☆'.repeat(5-(r.rating||0))}</span></div>
                {r.body&&<p className="text-xs text-gray-500">{r.body}</p>}
                <div className="text-[10px] text-gray-400 mt-1">{r.platform} · {r.created_at?.split('T')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
