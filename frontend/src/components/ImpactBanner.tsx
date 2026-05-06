import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { useDemoStore } from '../store';

export const ImpactBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const triggerScenario = useDemoStore(state => state.triggerScenario);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-12 left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-100"
        >
          <div className="bg-night/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-r from-sos-red/5 to-cyan/5 pointer-events-none" />
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 text-text-muted hover:text-white transition-colors"
              aria-label="Dismiss banner"
              title="Dismiss"
            >
              <X size={16} />
            </button>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(255,59,59,0.20)] flex items-center justify-center shrink-0">
                <AlertCircle className="text-[var(--color-emergency)]" size={24} />
              </div>

              <div className="flex-1 pr-4">
                <h3 className="text-white font-bold text-sm mb-1">Critical Impact Alert</h3>
                <p className="text-text-muted text-xs leading-relaxed mb-3">
                  Every <span className="text-[var(--color-emergency)] font-bold underline decoration-sos-red/30">3.4 minutes</span>, an Indian dies on the road. 
                  ROADSoS reduces coordination time from 9.2 minutes to <span className="text-[var(--color-safe)]-green font-bold">under 90 seconds</span>.
                </p>

                <button 
                  onClick={() => {
                    triggerScenario(1);
                    setIsVisible(false);
                  }}
                  className="flex items-center gap-2 text-cyan font-bold text-xs hover:gap-3 transition-all group/btn"
                >
                  Watch Live Demo <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
