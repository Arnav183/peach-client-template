import { useEffect, useState } from 'react';
import { MessageSquare, Copy, Check } from 'lucide-react';
import { api } from '../lib/api';
import ServiceGate from '../components/ServiceGate';

export default function AiChat() {
  return <ServiceGate serviceId="ai_chat_widget"><AiChatInner /></ServiceGate>;
}
function AiChatInner() {
  const [config, setConfig] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { api.chatConfig().then(setConfig); }, []);

  const embedCode = `<!-- Peach Stack AI Chat -->
<script>
  window.PeachChat = {
    businessName: "${config?.business_name || 'My Business'}",
    apiUrl: "${window.location.origin}/api/chat"
  };
</script>
<script src="${window.location.origin}/chat-widget.js" async></script>`;

  function copy() { navigator.clipboard.writeText(embedCode); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><MessageSquare size={22}/> AI Chat Widget</h1>
        <p className="text-gray-500 text-sm">Instant answers on your site, captures leads automatically</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Chat Widget</span><span className="badge-green">Active</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Business</span><span className="text-sm font-medium">{config?.business_name}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Industry</span><span className="text-sm font-medium capitalize">{config?.industry}</span></div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-3">What it does</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {['Answers FAQs 24/7','Captures visitor contact info','Books appointments directly','Qualifies leads before you call','Speaks your business language'].map(i=>(
              <li key={i} className="flex items-start gap-2"><span className="text-orange-500">✓</span>{i}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Embed Code</h2>
          <button onClick={copy} className="btn-secondary text-xs flex items-center gap-1.5">{copied?<><Check size={13}/> Copied!</>:<><Copy size={13}/> Copy</>}</button>
        </div>
        <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono">{embedCode}</pre>
        <p className="text-xs text-gray-400 mt-2">Paste before the closing body tag on your website.</p>
      </div>
    </div>
  );
}
