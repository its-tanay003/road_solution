import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, BarChart3, History, Check, ExternalLink } from 'lucide-react';
import { privacyConsent } from '../utils/privacyConsent';
import { Link } from 'react-router-dom';

const ConsentChip = ({ 
  icon: Icon, 
  label, 
  active, 
  required, 
  onClick 
}: { 
  icon: React.ComponentType<{ size?: number }>; 
  label: string; 
  active: boolean; 
  required?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={required ? undefined : onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      active 
        ? 'bg-(--clr-blue)/10 border-(--clr-blue) text-(--clr-text)' 
        : 'bg-white/5 border-white/10 text-(--clr-text-2) hover:border-white/20'
    } ${required ? 'cursor-default' : 'cursor-pointer'}`}
  >
    <div className={`p-2 rounded-lg ${active ? 'bg-(--clr-blue) text-white' : 'bg-white/10'}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-[10px] opacity-60">
        {required ? 'Required for emergency features' : 'Optional'}
      </p>
    </div>
    {active ? <Check size={16} className="text-(--clr-blue)" /> : <div className="w-4" />}
  </button>
);

export const PrivacyConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(() => !privacyConsent.hasConsent());
  const [consents, setConsents] = useState({
    emergencyLocation: true, // Initially true but user must see it
    analytics: false,
    incidentHistory: false,
  });

  const handleAccept = () => {
    privacyConsent.set({
      ...consents,
      version: '1.0',
      timestamp: Date.now(),
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-end justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-xl bg-(--clr-bg) border border-(--clr-border) rounded-2xl shadow-2xl overflow-hidden mb-4"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-(--clr-saffron)/20 text-(--clr-saffron) rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Privacy & Safety Consent</h2>
              <p className="text-xs text-(--clr-text-2)">ROADSoS complies with India's DPDP Act 2023.</p>
            </div>
          </div>

          <p className="text-sm text-(--clr-text-2) mb-6 leading-relaxed">
            We collect your location and incident data solely for emergency dispatch and medical assistance.
            Your safety is our priority, and your data is protected with production-grade encryption.
          </p>

          <div className="grid gap-3 mb-6">
            <ConsentChip 
              icon={MapPin} 
              label="Emergency Location Sharing" 
              active={consents.emergencyLocation} 
              required
            />
            <ConsentChip 
              icon={BarChart3} 
              label="Anonymous Analytics" 
              active={consents.analytics} 
              onClick={() => setConsents(c => ({ ...c, analytics: !c.analytics }))}
            />
            <ConsentChip 
              icon={History} 
              label="Incident History" 
              active={consents.incidentHistory} 
              onClick={() => setConsents(c => ({ ...c, incidentHistory: !c.incidentHistory }))}
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAccept}
              className="w-full py-4 bg-(--clr-blue) hover:bg-(--clr-blue-hover) text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              ACCEPT & PROCEED
            </button>
            <div className="flex justify-center">
              <Link 
                to="/privacy" 
                className="text-xs text-(--clr-text-2) hover:text-(--clr-blue) flex items-center gap-1.5 transition-colors"
                onClick={() => setIsVisible(false)} // Temporarily hide to see policy
              >
                View full Privacy Policy (DPDP 2023) <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
