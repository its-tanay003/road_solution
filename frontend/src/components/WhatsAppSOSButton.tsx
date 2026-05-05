import React from 'react';
import { motion } from 'framer-motion';
import { useMedicalProfileStore } from '../store/medicalProfileStore';
import { useSosStore } from '../store/index';

interface WhatsAppSOSButtonProps {
  isMeshMode?: boolean;
  isSecondary?: boolean;
}

export const WhatsAppSOSButton: React.FC<WhatsAppSOSButtonProps> = ({ isMeshMode, isSecondary }) => {
  const { name, bloodType, contacts } = useMedicalProfileStore();
  const { location } = useSosStore();

  const generateWhatsAppUrl = (phoneNumber?: string) => {
    const lat = location?.lat || 'LAT_UNKNOWN';
    const lng = location?.lng || 'LNG_UNKNOWN';
    const timestamp = new Date().toLocaleString();
    
    const message = `🚨 EMERGENCY ALERT from ROADSoS\nVictim: ${name || 'Unknown'}\nBlood Type: ${bloodType || 'Unknown'}\nGPS: ${lat},${lng}\nTime: ${timestamp}\nAccident detected: G-Force 12.4G\nRespond or call 112 immediately`;
    
    const baseUrl = "https://wa.me/";
    const target = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
    return `${baseUrl}${target}?text=${encodeURIComponent(message)}`;
  };

  const handleSendToAll = () => {
    if (contacts.length === 0) {
      alert("No emergency contacts found.");
      return;
    }
    // For demo purposes, we'll open the first one or a general share
    window.open(generateWhatsAppUrl(contacts[0].phone), '_blank');
  };

  const handleGeneralSOS = () => {
    window.open(generateWhatsAppUrl(), '_blank');
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={isSecondary ? {} : { x: [-2, 2, -2, 2, 0] }}
        transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
        onClick={handleGeneralSOS}
        className={`flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
          isSecondary ? 'bg-white/10 border border-white/20' : 'bg-[#25D366] hover:bg-[#128C7E]'
        }`}
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.389l-.72 2.634 2.697-.708c.813.447 1.745.702 2.736.702 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.809-5.767zm3.346 8.357c-.131.369-.678.678-1.012.726-.298.048-.678.083-1.096-.048-.262-.083-.583-.19-.988-.369-1.702-.75-2.81-2.488-2.893-2.607-.083-.119-.678-.893-.678-1.702 0-.81.417-1.202.571-1.369.155-.167.333-.202.44-.202h.321c.107 0 .25.012.369.298.131.321.44 1.083.476 1.155.036.071.06.155.012.25-.048.095-.071.155-.143.238-.071.083-.155.19-.214.25-.071.071-.143.155-.06.298.083.143.369.607.786 1.012.536.536.988.702 1.131.774.143.071.226.06.31-.036.083-.095.369-.429.464-.583.095-.155.19-.131.321-.083.131.048.833.393.976.464.143.071.238.107.274.167.036.06.036.333-.095.702z"/>
        </svg>
        {isMeshMode ? "Fallback: Internet unavailable" : "SEND SOS via WhatsApp"}
      </motion.button>

      {!isSecondary && (
        <button 
          onClick={handleSendToAll}
          className="text-[10px] font-mono text-[var(--clr-text-2)] uppercase tracking-widest hover:text-white transition-colors"
        >
          SEND TO ALL EMERGENCY CONTACTS
        </button>
      )}
    </div>
  );
};
