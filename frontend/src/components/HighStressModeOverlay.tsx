import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useEmergencyStore } from '../store/emergencyStore';
import { useWearableStore } from '../store/wearableStore';
import { Phone, ArrowRight } from 'lucide-react';
import { buttonAria } from '../utils/aria-utils';

export const HighStressModeOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    highStressMode, 
    setHighStressMode, 
    highStressAutoActivate,
    setTheme,
    setFontSize
  } = useAccessibilityStore();
  const { sosActive } = useEmergencyStore();
  const { health } = useWearableStore();

  const currentBpm = useMemo(() => {
    if (health.bpmHistory.length === 0) return 70;
    return health.bpmHistory[health.bpmHistory.length - 1].value;
  }, [health.bpmHistory]);

  // Auto-activate logic
  useEffect(() => {
    if (highStressAutoActivate) {
      if (sosActive || currentBpm > 120) {
        if (!highStressMode) {
          setHighStressMode(true);
          setTheme('high-contrast');
          setFontSize('xxl');
        }
      }
    }
  }, [sosActive, currentBpm, highStressAutoActivate, highStressMode, setHighStressMode, setTheme, setFontSize]);

  if (!highStressMode) return <>{children}</>;

  return (
    <div 
      className="fixed inset-0 z-10000 bg-black text-white p-8 flex flex-col items-center justify-center font-ui overflow-hidden"
      role="alert"
      aria-live="assertive"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--clr-red)_0%,transparent_70%)] animate-pulse" />
      
      <div className="relative z-10 w-full max-w-lg space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
            <span className="text-xl font-mono font-bold tracking-widest text-red-500">STRESS_LEVEL_MAX</span>
          </div>
          <button 
            onClick={() => setHighStressMode(false)}
            className="px-4 py-2 border border-white/20 rounded-lg text-sm font-mono opacity-50 hover:opacity-100"
            {...buttonAria("Exit High Stress Mode")}
          >
            EXIT_STRESS_MODE
          </button>
        </header>

        <main className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-black leading-tight uppercase">
              Stay Calm. Help is coming.
            </h1>
            <p className="text-3xl font-bold text-white/70">
              Breathe slowly. Follow the steps below.
            </p>
          </motion.div>

          <div className="space-y-6">
            <button 
              className="w-full py-8 bg-red-600 rounded-3xl flex items-center justify-center gap-4 text-3xl font-black shadow-[0_0_40px_rgba(220,38,38,0.5)]"
              {...buttonAria("Call Emergency Services 108")}
              onClick={() => window.open('tel:108')}
            >
              <Phone size={48} />
              CALL 108 NOW
            </button>
            
            <button 
              className="w-full py-8 bg-white text-black rounded-3xl flex items-center justify-center gap-4 text-3xl font-black"
              {...buttonAria("Go to next step of emergency guide")}
            >
              NEXT STEP
              <ArrowRight size={48} />
            </button>
          </div>
        </main>

        <footer className="pt-12 border-t border-white/10 flex items-center justify-between">
          <div className="flex gap-2" role="img" aria-label={`Stress level ${currentBpm > 140 ? 'Critical' : currentBpm > 120 ? 'High' : 'Elevated'}`}>
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level}
                className={`w-4 h-4 rounded-full ${level <= (currentBpm > 140 ? 5 : currentBpm > 120 ? 4 : 3) ? 'bg-red-500' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <p className="text-xl font-mono font-bold opacity-50">HEART_RATE: {Math.round(currentBpm)} BPM</p>
        </footer>
      </div>
    </div>
  );
};
