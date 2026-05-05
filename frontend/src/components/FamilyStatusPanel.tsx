import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, Clock, Send, MessageSquare } from 'lucide-react';
import { useMedicalProfileStore } from '../store/medicalProfileStore';
import { getWhatsAppLink, buildSOSMessage } from '../utils/whatsappNotify';
import { Button } from './ui/Button';

export const FamilyStatusPanel: React.FC<{ incidentId: string; location: { lat: number, lng: number } }> = ({ incidentId, location }) => {
  const { contacts, name } = useMedicalProfileStore();
  const [notifiedStates, setNotifiedStates] = useState<Record<number, 'IDLE' | 'SENDING' | 'SENT'>>({});

  const handleNotify = (idx: number, phone: string) => {
    setNotifiedStates(prev => ({ ...prev, [idx]: 'SENDING' }));
    
    // Simulate automated notification service
    setTimeout(() => {
      setNotifiedStates(prev => ({ ...prev, [idx]: 'SENT' }));
      
      // Open WhatsApp in new tab for manual fallback/confirmation
      const message = buildSOSMessage(name || 'User', location, { name: 'City Hospital', eta: 8 });
      window.open(getWhatsAppLink(phone, message), '_blank');
    }, 1500);
  };

  const handleNotifyAll = () => {
    contacts.forEach((contact, idx) => {
      if (notifiedStates[idx] !== 'SENT') {
        handleNotify(idx, contact.phone);
      }
    });
  };

  return (
    <div className="p-6 rounded-3xl bg-[#0A0F1A]/80 backdrop-blur-xl border border-white/10 shadow-2xl h-full flex flex-col font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            <Users className="text-[#2979FF]" size={16} />
            EMERGENCY CONTACTS NOTIFIED
          </h3>
          <p className="text-[10px] font-mono text-white/40 uppercase mt-1">Automatic Family Alert Protocol</p>
        </div>
        <CheckCircle2 className="text-[#2979FF] opacity-50" size={20} />
      </div>

      <div className="flex-1 space-y-4">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Users className="text-white/10 mb-2" size={32} />
            <p className="text-xs text-white/30 font-medium">No emergency contacts configured in your medical profile.</p>
          </div>
        ) : (
          contacts.map((contact, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#2979FF]/20 to-[#2979FF]/5 flex items-center justify-center border border-[#2979FF]/20">
                  <span className="text-xs font-bold text-[#2979FF]">{contact.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-tight">{contact.name}</h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/40 font-mono">{contact.relationship}</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1 font-mono">{contact.phone}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <AnimatePresence mode="wait">
                  {notifiedStates[idx] === 'SENT' ? (
                    <motion.div
                      key="sent"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-500 text-[8px] font-black uppercase flex items-center gap-1"
                    >
                      Notified ✓
                    </motion.div>
                  ) : notifiedStates[idx] === 'SENDING' ? (
                    <motion.div
                      key="sending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase flex items-center gap-1 animate-pulse"
                    >
                      Sending...
                    </motion.div>
                  ) : (
                    <button
                      key="idle"
                      onClick={() => handleNotify(idx, contact.phone)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-[#2979FF] hover:border-[#2979FF]/50 transition-all"
                    >
                      <Send size={14} />
                    </button>
                  )}
                </AnimatePresence>
                {notifiedStates[idx] === 'SENT' && (
                   <span className="text-[8px] font-mono text-white/20 uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3">
        <Button 
          variant="primary" 
          className="w-full h-12 rounded-2xl gap-2 font-black tracking-widest text-[10px] uppercase shadow-[0_0_20px_rgba(41,121,255,0.3)]"
          onClick={handleNotifyAll}
          disabled={contacts.length === 0}
        >
          <MessageSquare size={16} /> Broadcast to all
        </Button>
        <div className="flex items-center justify-center gap-2 text-[8px] font-mono text-white/20 uppercase tracking-widest">
           <Clock size={10} />
           INCIDENT TRACKING TOKEN: {incidentId.slice(0, 8)}
        </div>
      </div>
    </div>
  );
};
