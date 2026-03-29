import { useEffect, useState } from 'react';
import { Image } from 'lucide-react';
import { api } from '../lib/api';
import ServiceGate from '../components/ServiceGate';

export function Social() {
  return <ServiceGate serviceId="social_templates"><SocialInner /></ServiceGate>;
}
function SocialInner() {
  const [templates, setTemplates] = useState<any[]>([]);
  useEffect(() => { api.socialTemplates().then(setTemplates); }, []);
  const COLORS: any = { promo:'bg-orange-100 text-orange-700', seasonal:'bg-green-100 text-green-700', review:'bg-yellow-100 text-yellow-700', announcement:'bg-blue-100 text-blue-700' };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Image size={22}/> Social Media Templates</h1>
        <p className="text-gray-500 text-sm">20 branded Canva templates for Instagram + Facebook</p>
      </div>
      <div className="card p-4 mb-6 bg-orange-50 border-orange-100">
        <p className="text-sm text-orange-700">Your branded templates are created by Peach Stack and delivered via Canva. <a href="mailto:hello@peachstack.dev?subject=Social Templates" className="font-semibold underline">Contact us</a> to receive your pack.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {templates.map(t => (
          <div key={t.id} className="card p-4 flex flex-col gap-2">
            <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-3xl">{t.platform==='instagram'?'📸':'👍'}</span>
            </div>
            <div className="text-xs font-semibold text-gray-800">{t.name}</div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${COLORS[t.category]||'bg-gray-100 text-gray-600'}`}>{t.category}</span>
              <span className="text-[10px] text-gray-400">{t.platform}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
