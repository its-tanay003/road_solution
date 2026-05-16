import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { label: 'Connecting to emergency network…', pct: 25 },
  { label: 'Loading safety intelligence…',     pct: 55 },
  { label: 'Calibrating location services…',   pct: 80 },
  { label: 'Ready.',                            pct: 100 },
];

interface AppLoadingScreenProps {
  onComplete?: () => void;
}

export function AppLoadingScreen({ onComplete }: AppLoadingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const DELAYS = [400, 700, 600, 500];

    const advance = () => {
      if (current >= STEPS.length - 1) {
        setStepIndex(STEPS.length - 1);
        setTimeout(() => {
          setDone(true);
          onComplete?.();
        }, 600);
        return;
      }
      current++;
      setStepIndex(current);
      setTimeout(advance, DELAYS[current] ?? 500);
    };

    const t = setTimeout(advance, DELAYS[0]);
    return () => clearTimeout(t);
  }, [onComplete]);

  const step = STEPS[stepIndex];

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          className="fixed inset-0 bg-void flex flex-col items-center justify-center z-top gap-10 p-8"
          aria-label="Application loading"
          role="status"
          aria-live="polite"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex flex-col items-center gap-2"
          >
            {/* SOS emblem */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-ring shadow-red bg-[radial-gradient(circle_at_40%_40%,#FF4444,#CC0022)]"
            >
              <span className="font-display font-extrabold text-[22px] text-white tracking-[0.06em]">
                SOS
              </span>
            </div>

            <div className="text-center mt-2">
              <p className="m-0 font-display font-bold text-[28px] text-text tracking-[-0.01em]">
                ROAD<span className="text-red">SoS</span>
              </p>
              <p className="m-0 font-body text-[12px] text-text-secondary opacity-60 tracking-[0.12em] uppercase">
                Emergency Intelligence
              </p>
            </div>
          </motion.div>

          {/* Progress area */}
          <div className="w-full max-w-[280px] flex flex-col gap-3.5">
            {/* Track */}
            <div className="h-[3px] bg-hover rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${step.pct}%` }}
                transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
                className="h-full rounded-full bg-linear-to-r from-saffron to-red shadow-[0_0_8px_rgba(255,153,51,0.6)]"
              />
            </div>

            {/* Step label */}
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="m-0 font-mono text-[12px] text-text-secondary text-center tracking-[0.02em]"
              >
                {step.label}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Bottom tagline */}
          <p className="absolute bottom-10 m-0 font-body text-[11px] text-text-secondary opacity-60 text-center tracking-[0.04em]">
            Every second matters.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
