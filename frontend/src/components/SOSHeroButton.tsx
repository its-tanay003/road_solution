import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { announce } from '../lib/accessibilityHelpers';
import './SOSHeroButton.css';

const HOLD_DURATION = 3000; // ms
const RADIUS = 44;          // SVG ring radius
const CIRC   = 2 * Math.PI * RADIUS;

interface SOSHeroButtonProps {
  /** Callback when hold completes — use to trigger SOS flow */
  onActivate?: () => void;
  lang?: 'en' | 'hi' | 'ta';
}

const LABELS: Record<string, string> = {
  en: 'Hold 3 seconds for emergency',
  hi: '3 सेकंड दबाए रखें',
  ta: '3 விநாடி அழுத்துங்கள்',
};

export function SOSHeroButton({ onActivate, lang = 'en' }: SOSHeroButtonProps) {
  const navigate    = useNavigate();
  const [progress, setProgress] = useState(0);   // 0-100
  const [holding, setHolding]   = useState(false);
  const [flashing, setFlashing] = useState(false);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef    = useRef<number | null>(null);
  const startRef  = useRef<number>(0);
  const tapCount  = useRef(0);

  const strokeOffset = CIRC - (progress / 100) * CIRC;

  const startHold = useCallback(() => {
    setHolding(true);
    startRef.current = Date.now();

    // Haptic milestones
    const h1 = setTimeout(() => navigator.vibrate?.(50),  1000);
    const h2 = setTimeout(() => navigator.vibrate?.(100), 2000);

    timerRef.current = setTimeout(() => {
      navigator.vibrate?.([200, 100, 200]);
      setFlashing(true);
      announce('SOS activated. Connecting to emergency services.', 'assertive');
      setTimeout(() => {
        onActivate?.();
        navigate('/sos-active');
      }, 400);
      clearTimeout(h1);
      clearTimeout(h2);
    }, HOLD_DURATION);

    const tick = () => {
      const pct = Math.min(((Date.now() - startRef.current) / HOLD_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [navigate, onActivate]);

  const cancelHold = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setHolding(false);
    setProgress(0);
  }, []);

  // Double-tap — show contacts overlay
  const handleClick = () => {
    tapCount.current += 1;
    setTimeout(() => { tapCount.current = 0; }, 300);
    if (tapCount.current >= 2) {
      // TODO: show quick contacts overlay
    }
  };

  return (
    <div className="sos-hero-container">
      {/* Outer pulse rings */}
      <div className="sos-hero-ring-wrapper">

        {/* Ring 3 — slowest */}
        <motion.div animate={{ scale: holding ? [1, 1.1, 1] : [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="sos-hero-ring-3" />
        {/* Ring 2 */}
        <motion.div animate={{ scale: holding ? [1, 1.12, 1] : [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="sos-hero-ring-2" />
        {/* Ring 1 — fastest */}
        <motion.div animate={{ scale: holding ? [1, 1.15, 1] : [1, 1.07, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="sos-hero-ring-1" />

        {/* SVG progress ring */}
        <svg className="sos-hero-svg" viewBox="0 0 96 96" aria-hidden="true">
          {/* Track */}
          <circle cx="48" cy="48" r={RADIUS} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          {/* Fill */}
          <motion.circle
            cx="48" cy="48" r={RADIUS}
            fill="none"
            stroke={flashing ? '#FFFFFF' : '#FF1744'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 0.05, ease: 'linear' }}
            transform="rotate(-90 48 48)"
          />
        </svg>

        {/* Core button */}
        <motion.button
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onClick={handleClick}
          aria-label="SOS Emergency button — hold for 3 seconds to activate"
          whileTap={{ scale: 0.95 }}
          animate={flashing ? { backgroundColor: ['#FF4444', '#FFFFFF', '#FF4444'] } : {}}
          transition={{ duration: 0.3, repeat: flashing ? 2 : 0 }}
          className={`sos-hero-btn ${holding ? 'holding' : ''}`}
        >
          {/* Shield icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z"
              stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.15)" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sos-hero-label">SOS</span>
        </motion.button>
      </div>

      {/* Instruction label */}
      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="sos-hero-instruction"
      >
        {LABELS[lang]}
      </motion.p>

      {/* Voice hint */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="sos-hero-voice-hint"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="var(--saffron)" strokeWidth="2" fill="none"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="var(--saffron)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="sos-hero-voice-text">
          Or say: <strong className="sos-hero-voice-command">Hey ROADSoS</strong>
        </span>
      </motion.div>
    </div>
  );
}
