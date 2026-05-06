import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  Phone, 
  Activity,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OfflineTriageProtocol } from './OfflineTriageProtocol';
import { useUserStore } from '../store';
import emergencyData from '../data/emergency-numbers.json';

export const OfflineTriageOrchestrator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showTriage, setShowTriage] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { countryCode } = useUserStore();
  const emergencyNumber = (emergencyData as Record<string, { emergency: string }>)[countryCode]?.emergency || '112';

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false); // Re-prompt on new offline state
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Tactical Check: Periodically ping local health endpoint if online
    // to detect "Fake Online" (connected to router but no internet)
    const tacticalCheck = setInterval(async () => {
      if (navigator.onLine) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const res = await fetch('/api/health', { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) setIsOffline(true);
          else setIsOffline(false);
        } catch (e) {
          setIsOffline(true);
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(tacticalCheck);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOffline && !isDismissed && !showTriage && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-md"
          >
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-4 overflow-hidden relative group">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent pointer-events-none" />
              
              <div className="flex items-start gap-4 relative">
                <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/30">
                  <WifiOff className="text-amber-500 animate-pulse" size={24} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-black uppercase tracking-tighter text-lg leading-none mb-1">
                    Connection Lost
                  </h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed mb-4">
                    Emergency guidance is still available offline. Would you like to start the triage protocol?
                  </p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowTriage(true)}
                      className="flex-1 bg-white text-black h-10 rounded-[var(--radius-lg)] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Activity size={14} />
                      Start Triage
                    </button>
                    <button 
                      onClick={() => setIsDismissed(true)}
                      className="bg-slate-800 text-slate-300 w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center hover:bg-slate-700 transition-colors"
                      aria-label="Dismiss"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showTriage && (
          <OfflineTriageProtocol 
            onClose={() => setShowTriage(false)} 
            emergencyNumber={emergencyNumber}
          />
        )}
      </AnimatePresence>
      
      {/* Tactical Floating SOS Button (Only offline) */}
      <AnimatePresence>
        {isOffline && !showTriage && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowTriage(true)}
            className="fixed bottom-24 right-6 z-1000 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-900/40 border-4 border-white/20 group"
            aria-label="Emergency Offline Triage"
          >
            <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20" />
            <Phone size={28} className="text-white group-hover:scale-110 transition-transform" fill="currentColor" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
