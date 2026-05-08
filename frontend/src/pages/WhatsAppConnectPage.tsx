import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const WhatsAppConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { whatsappNumber, setWhatsapp } = useAuthStore();
  const [phone, setPhone] = useState(whatsappNumber || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConnect = async () => {
    if (!phone) return;
    setLoading(true);
    // Mock API call
    await new Promise(r => setTimeout(r, 1500));
    setWhatsapp(phone);
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/settings'), 1500);
  };

  return (
    <div className="min-h-screen bg-(--clr-bg) text-(--clr-text)">
      <header className="p-4 flex items-center gap-4 border-b border-white/10">
        <button onClick={() => navigate('/settings')} className="p-2 hover:bg-white/5 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">WhatsApp Alerts</h1>
      </header>

      <main className="max-w-md mx-auto p-8 text-center">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/10">
          <MessageCircle size={40} />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Instant Crisis Alerts</h2>
        <p className="text-sm text-(--clr-text-2) mb-8 leading-relaxed">
          Receive real-time crash reports and volunteer dispatch requests directly on your WhatsApp.
        </p>

        <div className="space-y-6">
          <div className="text-left space-y-2">
            <label className="text-[10px] font-bold text-(--clr-text-2) uppercase ml-1">WhatsApp Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--clr-text-2) font-bold">+91</span>
              <input
                type="tel"
                value={phone.replace('+91', '')}
                onChange={(e) => setPhone(`+91${e.target.value.replace(/\D/g, '')}`)}
                placeholder="XXXXXXXXXX"
                className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:border-green-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-3">
            <div className="flex gap-3 items-start">
              <ShieldCheck size={16} className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-xs text-(--clr-text-2)">End-to-end encrypted emergency notifications.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-xs text-(--clr-text-2)">Official ROADSoS Verified Business channel.</p>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading || phone.length < 13}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : success ? 'CONNECTED ✓' : 'CONNECT WHATSAPP'}
          </button>
        </div>
      </main>
    </div>
  );
};
