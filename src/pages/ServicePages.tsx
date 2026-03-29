import ServiceGate from '../components/ServiceGate';
import { Phone, Search, Globe, Headphones } from 'lucide-react';

export function AiPhone() {
  return (
    <ServiceGate serviceId="ai_phone_agent">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Phone size={22}/> AI Phone Agent</h1><p className="text-gray-500 text-sm">Answers calls 24/7, books appointments, handles FAQs</p></div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card p-5"><h2 className="font-semibold mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">AI Phone Agent</span><span className="badge-green">Active</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Availability</span><span className="text-sm font-medium">24/7</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Missed Leads</span><span className="badge-green">Zero</span></div>
            </div>
          </div>
          <div className="card p-5"><h2 className="font-semibold mb-3">Capabilities</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {['Answers inbound calls instantly','Books appointments automatically','Handles common FAQs','Takes messages when needed','Never misses a lead'].map(i=>(
                <li key={i} className="flex items-start gap-2"><span className="text-orange-500">✓</span>{i}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card p-5 bg-orange-50 border-orange-100"><p className="text-sm text-orange-700 font-medium mb-1">📞 Setup Required</p><p className="text-sm text-orange-600"><a href="mailto:hello@peachstack.dev?subject=AI Phone Setup" className="font-semibold underline">Contact Peach Stack</a> to get your dedicated AI phone number configured.</p></div>
      </div>
    </ServiceGate>
  );
}

export function Seo() {
  return (
    <ServiceGate serviceId="local_seo">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Search size={22}/> Local SEO</h1><p className="text-gray-500 text-sm">Get found on Google Maps and local search</p></div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[{label:'Google Business Profile',status:'Setup Needed',c:'badge-yellow'},{label:'Local Citations',status:'In Progress',c:'badge-blue'},{label:'Keywords',status:'Active',c:'badge-green'}].map(i=>(
            <div key={i.label} className="card p-4"><div className="text-sm font-medium mb-2">{i.label}</div><span className={i.c}>{i.status}</span></div>
          ))}
        </div>
        <div className="card p-5 mb-4"><h2 className="font-semibold mb-3">Included</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {['Google Business Profile optimization','Local keyword research','20+ directory citations','Monthly ranking reports','Map pack optimization'].map(i=>(
              <li key={i} className="flex items-start gap-2"><span className="text-orange-500">✓</span>{i}</li>
            ))}
          </ul>
        </div>
        <div className="card p-4 bg-blue-50 border-blue-100"><p className="text-sm text-blue-700">Add <code className="bg-blue-100 px-1 rounded">GOOGLE_MAPS_API_KEY</code> for live data. <a href="mailto:hello@peachstack.dev?subject=SEO Setup" className="font-semibold underline">Contact Peach Stack</a> to kick off setup.</p></div>
      </div>
    </ServiceGate>
  );
}

export function Website() {
  return (
    <ServiceGate serviceId="basic_website">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Globe size={22}/> Website</h1><p className="text-gray-500 text-sm">Your business website managed by Peach Stack</p></div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card p-5"><h2 className="font-semibold mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Status</span><span className="badge-green">Live</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Hosting</span><span className="text-sm font-medium">Included</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">SSL</span><span className="badge-green">Secured</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Mobile</span><span className="badge-green">Ready</span></div>
            </div>
          </div>
          <div className="card p-5"><h2 className="font-semibold mb-3">Your Pages</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {['Home','About','Services','Gallery','Contact'].map(p=>(
                <li key={p} className="flex items-center gap-2"><span className="text-green-500">✓</span>{p}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card p-4 bg-orange-50 border-orange-100"><p className="text-sm text-orange-700">Need changes? <a href="mailto:hello@peachstack.dev?subject=Website Update" className="font-semibold underline">Contact Peach Stack</a> — included in your plan.</p></div>
      </div>
    </ServiceGate>
  );
}

export function Support() {
  return (
    <ServiceGate serviceId="priority_support">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Headphones size={22}/> Priority Support</h1><p className="text-gray-500 text-sm">Your dedicated Peach Stack support channel</p></div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[{label:'Response Time',value:'Same Day',icon:'⚡'},{label:'Monthly Check-in',value:'Included',icon:'📅'},{label:'Monitoring',value:'Proactive',icon:'👀'}].map(s=>(
            <div key={s.label} className="card p-4 text-center"><div className="text-2xl mb-2">{s.icon}</div><div className="font-bold text-sm">{s.value}</div><div className="text-xs text-gray-500">{s.label}</div></div>
          ))}
        </div>
        <div className="card p-5"><h2 className="font-semibold mb-4">Contact Support</h2>
          <div className="space-y-3">
            <a href="mailto:hello@peachstack.dev" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <span className="text-xl">📧</span><div><div className="text-sm font-medium">Email Support</div><div className="text-xs text-gray-400">hello@peachstack.dev</div></div>
            </a>
            <a href="sms:+14045550100" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <span className="text-xl">💬</span><div><div className="text-sm font-medium">Text Us</div><div className="text-xs text-gray-400">+1 (404) 555-0100</div></div>
            </a>
          </div>
        </div>
      </div>
    </ServiceGate>
  );
}
