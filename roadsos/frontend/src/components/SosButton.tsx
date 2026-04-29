import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSosStore } from '../store';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export const SosButton = () => {
  const { t } = useTranslation();
  const { isTriggering, isActive, triggerSos, cancelSos, setTrackingToken, location } = useSosStore();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTriggering && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isTriggering && countdown === 0) {
      fireSosApi();
    }
    return () => clearTimeout(timer);
  }, [isTriggering, countdown]);

  const handlePress = () => {
    if (!isTriggering && !isActive) {
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      setCountdown(3);
      triggerSos();
    }
  };

  const fireSosApi = async () => {
    try {
      const payload = {
        deviceId: 'local-test-device', // Usually derived from local storage or native API
        lat: location?.lat || 28.6139,
        lng: location?.lng || 77.2090,
        contactPhones: ['+919876543210'] // Pulled from userStore in prod
      };
      
      // We will mock the API call if backend isn't available
      const response = await axios.post('http://localhost:3000/api/sos/trigger', payload).catch(() => {
        console.warn("Backend not reachable, mocking SOS activation");
        return { data: { token: 'mock-token-123' } };
      });
      
      setTrackingToken(response.data.token);
      
      // Auto dial ambulance
      window.location.href = 'tel:108';
    } catch (err) {
      console.error(err);
      cancelSos();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {!isActive ? (
          <div className="relative flex items-center justify-center w-80 h-80">
            {/* Radar Sweep Effect */}
            {!isTriggering && (
              <>
                <motion.div 
                  className="absolute inset-0 rounded-full border border-emergency opacity-20"
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div 
                  className="absolute inset-0 rounded-full border border-emergency opacity-20"
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                />
                <div className="absolute inset-0 rounded-full bg-emergency/5 blur-xl"></div>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isTriggering ? cancelSos : handlePress}
              className={`relative z-10 flex items-center justify-center w-64 h-64 rounded-full text-white font-condensed text-6xl font-bold tracking-wider shadow-[0_0_40px_rgba(215,38,56,0.5)] transition-colors border border-emergency/50 ${isTriggering ? 'bg-amber-600 shadow-[0_0_40px_rgba(244,162,97,0.5)]' : 'bg-gradient-to-b from-emergency to-red-900'}`}
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
              animate={!isTriggering ? {
                boxShadow: ["0px 0px 40px rgba(215,38,56,0.4)", "0px 0px 80px rgba(215,38,56,0.8)", "0px 0px 40px rgba(215,38,56,0.4)"]
              } : {}}
              transition={!isTriggering ? { duration: 1.5, repeat: Infinity } : {}}
            >
              <div className="absolute inset-2 rounded-full border border-white/20"></div>
              {isTriggering ? (
                <div className="flex flex-col items-center">
                  <span className="text-8xl">{countdown}</span>
                  <span className="text-xl mt-2 font-sans tracking-normal">{t('sos.cancel')}</span>
                </div>
              ) : (
                <span className="drop-shadow-lg">{t('sos.button')}</span>
              )}
            </motion.button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center w-full max-w-sm text-center space-y-6 bg-navy/80 backdrop-blur-xl p-8 rounded-3xl border border-safe/30 shadow-[0_0_50px_rgba(46,196,182,0.15)]"
            style={{ perspective: 1000 }}
          >
            <div className="text-4xl font-condensed font-bold text-safe drop-shadow-[0_0_10px_rgba(46,196,182,0.8)]">
              {t('sos.help_coming')}
            </div>
            
            <div className="space-y-4 text-lg font-mono text-left w-full text-card">
              <motion.div className="flex items-center space-x-3 bg-black/40 p-3 rounded-lg border border-white/5" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <span className="text-safe text-2xl">⚡</span> <span>{t('sos.status.ambulance')}</span>
              </motion.div>
              <motion.div className="flex items-center space-x-3 bg-black/40 p-3 rounded-lg border border-white/5" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.0 }}>
                <span className="text-amber text-2xl">📡</span> <span>{t('sos.status.contacts')}</span>
              </motion.div>
              <motion.div className="flex items-center space-x-3 bg-black/40 p-3 rounded-lg border border-white/5" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }}>
                <span className="text-blue-400 text-2xl">🛰️</span> <span>{t('sos.status.location')}</span>
              </motion.div>
            </div>

            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-6 p-4 rounded-xl bg-safe/10 border border-safe/20 text-safe font-sans font-semibold tracking-wide"
            >
              {t('sos.stay_calm')}
            </motion.div>

            <button onClick={cancelSos} className="mt-6 w-full py-3 bg-transparent border border-muted text-muted hover:bg-muted/10 hover:text-white transition-colors rounded-xl font-bold uppercase tracking-wider">
              Abort Signal
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
