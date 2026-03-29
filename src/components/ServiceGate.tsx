import { useAuth } from '../context/AuthContext';
import { ALL_SERVICES } from '../lib/services';
import { Lock } from 'lucide-react';

interface Props { serviceId: string; children: React.ReactNode; }

export default function ServiceGate({ serviceId, children }: Props) {
  const { hasService } = useAuth();
  if (hasService(serviceId)) return <>{children}</>;
  const svc = ALL_SERVICES.find(s => s.id === serviceId);
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="text-orange-500" size={28} />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{svc?.name ?? 'This feature'} is not active</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-4">
        This feature is not part of your current plan. Contact Peach Stack to add it.
      </p>
      {svc && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-5 py-3 text-sm text-orange-700 mb-4">
          {svc.setupFee > 0 && <span className="font-semibold">${svc.setupFee} setup</span>}
          {svc.setupFee > 0 && svc.monthlyFee > 0 && <span> + </span>}
          {svc.monthlyFee > 0 && <span className="font-semibold">${svc.monthlyFee}/mo</span>}
        </div>
      )}
      <a href="mailto:hello@peachstack.dev?subject=Upgrade Request" className="btn-primary text-sm">
        Contact Peach Stack to Upgrade
      </a>
    </div>
  );
}
