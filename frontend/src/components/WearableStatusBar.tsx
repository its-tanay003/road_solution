import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Vitals {
  hr:   number;
  spo2: number;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

const INITIAL_VITALS: Vitals = { hr: 72, spo2: 98, status: 'NORMAL' };

// Simulated vitals — replace with real wearable SDK
function useVitals(): Vitals | null {
  const [vitals, setVitals] = useState<Vitals | null>(() => 
    process.env.NODE_ENV === 'development' ? INITIAL_VITALS : null
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      setVitals(prev => {
        if (!prev) return INITIAL_VITALS;
        const hr = Math.max(55, Math.min(120, prev.hr + Math.round((Math.random() - 0.5) * 3)));
        const spo2 = Math.max(94, Math.min(100, prev.spo2 + Math.round((Math.random() - 0.5) * 1)));
        const status: Vitals['status'] = hr > 100 || spo2 < 96 ? 'ELEVATED' : 'NORMAL';
        return { hr, spo2, status };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return vitals;
}


export function WearableStatusBar() {
  const vitals = useVitals();

  if (!vitals) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        aria-label="Wearable vitals"
        className="vitals-bar"
      >
        {/* HR */}
        <div className="vital-item">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: (60 / vitals.hr), repeat: Infinity, ease: 'easeInOut' }}
            className="vital-icon"
          >
            💓
          </motion.span>
          <span className="vital-value vital-value--hr">
            {vitals.hr}
          </span>
          <span className="vital-unit">bpm</span>
        </div>

        <div className="vital-divider" />

        {/* SpO2 */}
        <div className="vital-item">
          <span className="vital-icon">🫁</span>
          <span className="vital-value vital-value--spo2">
            {vitals.spo2}%
          </span>
          <span className="vital-unit">SpO₂</span>
        </div>

        <div className="vital-divider" />

        {/* Status */}
        <div className="vital-status">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`vital-dot vital-dot--${vitals.status}`}
          />
          <span className={`vital-status-label vital-status-label--${vitals.status}`}>
            {vitals.status}
          </span>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
