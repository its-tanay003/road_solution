import React, { useEffect, useState } from 'react';
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-void)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            gap: 40,
            padding: 32,
          }}
          aria-label="Application loading"
          role="status"
          aria-live="polite"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            {/* SOS emblem */}
            <div style={{
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, #FF4444, #CC0022)',
              boxShadow: '0 0 40px rgba(255,23,68,0.40), 0 0 80px rgba(255,23,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse-ring 2.5s ease-in-out infinite',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 22,
                color: '#FFFFFF',
                letterSpacing: '0.06em',
              }}>
                SOS
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 28,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}>
                ROAD<span style={{ color: 'var(--red)' }}>SoS</span>
              </p>
              <p style={{
                margin: '4px 0 0',
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--text-hint)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                Emergency Intelligence
              </p>
            </div>
          </motion.div>

          {/* Progress area */}
          <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Track */}
            <div style={{
              height: 3,
              background: 'var(--bg-hover)',
              borderRadius: 999,
              overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${step.pct}%` }}
                transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, var(--saffron), var(--red))',
                  boxShadow: '0 0 8px rgba(255,153,51,0.6)',
                }}
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
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  letterSpacing: '0.02em',
                }}
              >
                {step.label}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Bottom tagline */}
          <p style={{
            position: 'absolute',
            bottom: 40,
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            color: 'var(--text-hint)',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}>
            Every second matters.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
