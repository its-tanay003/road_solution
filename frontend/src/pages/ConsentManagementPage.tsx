import React, { useState } from 'react';
import { ArrowLeft, Shield, Lock, Eye, Share2, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RowProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  active: boolean;
  onToggle: () => void;
  critical?: boolean;
}

const Row: React.FC<RowProps> = ({ 
  icon: Icon, 
  title, 
  desc, 
  active, 
  onToggle,
  critical = false 
}) => (
  <div className="p-6 border-b border-white/5 last:border-0">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${critical ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-(--clr-text-2)'}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-sm">{title}</h4>
          <button
            onClick={onToggle}
            aria-label={`Toggle ${title}`}
            className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-(--clr-blue)' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
        <p className="text-xs text-(--clr-text-2) leading-relaxed">{desc}</p>
        {critical && active && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded">
            <AlertTriangle size={12} /> CRITICAL FOR SOS
          </div>
        )}
      </div>
    </div>
  </div>
);

export const ConsentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [consents, setConsents] = useState({
    location: true,
    medical: true,
    contacts: true,
    analytics: false,
    marketing: false
  });

  const toggleConsent = (key: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-(--clr-bg) text-(--clr-text) pb-20">
      <header className="sticky top-0 z-50 bg-(--clr-bg)/80 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/settings')}
            aria-label="Back to Settings"
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-space uppercase">Privacy Control</h1>
            <p className="text-[10px] font-mono text-(--clr-blue) tracking-widest uppercase">DPDP Compliance Mode</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8">
        <div className="px-6 mb-8">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <h3 className="text-amber-500 font-bold flex items-center gap-2 mb-2">
              <Shield size={18} /> DPDP Act 2023 Compliance
            </h3>
            <p className="text-sm text-amber-500/80 leading-relaxed">
              You have the right to withdraw consent at any time. Withdrawal of consent for critical services like 
              <strong> Location Sharing</strong> will disable automatic crash detection features.
            </p>
          </div>
        </div>

        <h3 className="px-6 mb-2 text-[10px] font-bold tracking-[0.2em] text-(--clr-text-2) uppercase">Data Usage Consents</h3>
        <div className="bg-white/5 border-y border-white/10">
          <Row 
            icon={Eye} 
            title="Real-time Location" 
            desc="Allows the app to track your coordinates for crash detection. Shared with responders only during an active SOS."
            active={consents.location}
            onToggle={() => toggleConsent('location')}
            critical
          />
          <Row 
            icon={Lock} 
            title="Medical Profile Access" 
            desc="Responders can view your blood group, allergies, and surgical history to provide better care at the crash site."
            active={consents.medical}
            onToggle={() => toggleConsent('medical')}
            critical
          />
          <Row 
            icon={Share2} 
            title="Emergency Contact Sharing" 
            desc="Automatically notify your trusted circle with your live location and incident details via WhatsApp/SMS."
            active={consents.contacts}
            onToggle={() => toggleConsent('contacts')}
            critical
          />
          <Row 
            icon={FileText} 
            title="Usage Analytics" 
            desc="Anonymous data collection to improve the app's triage accuracy and performance monitoring."
            active={consents.analytics}
            onToggle={() => toggleConsent('analytics')}
          />
        </div>

        <div className="mt-8 px-6 space-y-4">
          <button 
            onClick={() => window.open('/privacy')}
            className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <FileText size={20} className="text-(--clr-blue)" />
              <div className="text-left">
                <p className="text-sm font-bold">Full Privacy Policy</p>
                <p className="text-[10px] text-(--clr-text-2)">Version 2.1 (Updated Oct 2026)</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-(--clr-text-2) opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>

          <button 
            className="w-full py-4 text-red-500 text-sm font-bold border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-all"
          >
            WITHDRAW ALL CONSENT
          </button>
        </div>
      </main>
    </div>
  );
};
