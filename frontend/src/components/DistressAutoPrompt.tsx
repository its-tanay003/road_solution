import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import { useSosStore } from '../store';

export const DistressAutoPrompt: React.FC = () => {
  const { autoPromptActive, dismissAutoPrompt, clearDistressEvents: clearEvents, triggerSos } = useSosStore();
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    let timer: number;
    
    if (autoPromptActive) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            window.clearInterval(timer);
            // Time's up, auto-trigger SOS
            triggerSos();
            dismissAutoPrompt();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [autoPromptActive, triggerSos, dismissAutoPrompt]);

  const handleImOk = () => {
    dismissAutoPrompt();
    clearEvents();
  };

  const handleTriggerNow = () => {
    triggerSos();
    dismissAutoPrompt();
  };

  return (
    <AnimatePresence>
      {autoPromptActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-10000 bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md bg-(--nx-bg-elevated) border-2 border-(--nx-red-primary) p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(255,59,59,0.2)]"
          >
            <div className="w-20 h-20 bg-(--nx-red-primary)/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <AlertTriangle size={40} className="text-(--nx-red-primary)" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">CRITICAL DISTRESS DETECTED</h2>
            <p className="text-(--nx-text-secondary) mb-8">
              Your device interaction patterns indicate a potential emergency. Auto-SOS will trigger in {timeLeft} seconds.
            </p>

            <div className="text-6xl font-black text-(--nx-red-primary) mb-8 font-mono">
              00:{timeLeft.toString().padStart(2, '0')}
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={handleTriggerNow}
                className="w-full py-4 bg-(--nx-red-primary) text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
              >
                <AlertTriangle size={20} />
                TRIGGER SOS NOW
              </button>
              
              <button
                onClick={handleImOk}
                className="w-full py-4 bg-transparent border border-(--nx-border-active) text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                <Check size={20} className="text-(--nx-green-primary)" />
                I'M OKAY (CANCEL)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
