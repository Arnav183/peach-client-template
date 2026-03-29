import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ALL_SERVICES, CATEGORY_LABELS, CATEGORY_ICONS } from '../lib/services';

export default function Settings() {
  const { settings: ctxSettings, services } = useAuth();
  const [form, setForm] = useState({ business_name: '', phone: '', address: '', logo_url: '', accent_color: '#f97316' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ctxSettings) {
      setForm({
        business_name: ctxSettings.business_name || '',
        phone: ctxSettings.phone || '',
        address: ctxSettings.address || '',
        logo_url: ctxSettings.logo_url || '',
        accent_color: ctxSettings.accent_color || '#f97316',
      });
    }
  }, [ctxSettings]);

  async function handleSave() {
    await api.updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const activeIds = services?.active || [];
  const grouped = ['core','website','bookings','ai','marketing','support'] as const;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><SettingsIcon size={22} /> Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your business info and active services</p>
      </div>

      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Business Information</h2>
        <div className="space-y-4">
          {[['business_name','Business Name','text'],['phone','Phone Number','tel'],['address','Address','text'],['logo_url','Logo URL','url']].map(([f,l,t]) => (
            <div key={f}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{l}</label>
              <input type={t} className="input" value={(form as any)[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" className="h-9 w-16 rounded-lg border border-gray-200 cursor-pointer" value={form.accent_color} onChange={e => setForm(p => ({ ...p, accent_color: e.target.value }))} />
              <span className="text-sm text-gray-500 font-mono">{form.accent_color}</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save size={15} /> Save Changes</button>
          {saved && <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle size={14} /> Saved!</span>}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-1">Your Active Services</h2>
        <p className="text-xs text-gray-400 mb-4">Managed via <code className="bg-gray-100 px-1 rounded">ACTIVE_SERVICES</code> env var. Contact Peach Stack to upgrade.</p>
        <div className="space-y-5">
          {grouped.map(cat => {
            const catServices = ALL_SERVICES.filter(s => s.category === cat);
            return (
              <div key={cat}>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </div>
                <div className="space-y-1.5">
                  {catServices.map(svc => {
                    const active = activeIds.includes(svc.id) || svc.required;
                    return (
                      <div key={svc.id} className={`flex items-center justify-between p-3 rounded-lg border ${active ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                        <div>
                          <div className={`text-sm font-medium ${active ? 'text-green-800' : 'text-gray-400'}`}>{svc.name}</div>
                          {!active && (svc.setupFee > 0 || svc.monthlyFee > 0) && (
                            <div className="text-xs text-gray-400">
                              {svc.setupFee > 0 ? `$${svc.setupFee} setup` : ''}{svc.setupFee > 0 && svc.monthlyFee > 0 ? ' + ' : ''}{svc.monthlyFee > 0 ? `$${svc.monthlyFee}/mo` : ''}
                            </div>
                          )}
                        </div>
                        {active
                          ? <span className="badge-green text-[10px]">✓ Active</span>
                          : <a href="mailto:hello@peachstack.dev?subject=Upgrade Request" className="text-[10px] text-orange-500 hover:underline font-medium">Add →</a>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
