import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Vitals {
  hr:   number;
  spo2: number;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

// Simulated vitals — replace with real wearable SDK
function useVitals(): Vitals | null {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if a wearable is available via Web Bluetooth or simulated
    const sim = process.env.NODE_ENV === 'development';
    if (!sim) return;

    // Simulated connected wearable
    setConnected(true);
    setVitals({ hr: 72, spo2: 98, status: 'NORMAL' });

    const interval = setInterval(() => {
      setVitals(prev => {
        if (!prev) return null;
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

const STATUS_COLOR: Record<Vitals['status'], string> = {
  NORMAL:   'var(--green)',
  ELEVATED: 'var(--amber)',
  CRITICAL: 'var(--red)',
};

export function WearableStatusBar() {
  const vitals = useVitals();

  if (!vitals) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        aria-label="Wearable vitals"
        style={{
          margin: '0 var(--sp-4)',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* HR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: (60 / vitals.hr), repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 16 }}
          >
            💓
          </motion.span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--red)' }}>
            {vitals.hr}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-hint)' }}>bpm</span>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {/* SpO2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>🫁</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--blue)' }}>
            {vitals.spo2}%
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-hint)' }}>SpO₂</span>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[vitals.status] }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: STATUS_COLOR[vitals.status], fontWeight: 700, letterSpacing: '0.06em',
          }}>
            {vitals.status}
          </span>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
