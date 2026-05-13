import React, { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticSOS, hapticLight, announce } from '../lib/accessibilityHelpers';

// ── Long-press hook ──────────────────────────────────────────────
function useLongPress(onLongPress: () => void, duration = 1500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const start = useCallback(() => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onLongPress();
      setProgress(0);
    }, duration);

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (elapsed < duration) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onLongPress, duration]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(0);
  }, []);

  return { handlers: { onPointerDown: start, onPointerUp: cancel, onPointerLeave: cancel }, progress };
}

// ── SVG stroke-dasharray progress ring ──────────────────────────
const RADIUS = 28;
const CIRC   = 2 * Math.PI * RADIUS;

export function SOSFloatButton() {
  const navigate  = useNavigate();
  const [tooltip, setTooltip] = useState(false);
  const [activated, setActivated] = useState(false);

  const handleLongPress = useCallback(() => {
    hapticSOS();
    announce('SOS activated. Calling emergency services.', 'assertive');
    setActivated(true);
    navigate('/sos-active');
  }, [navigate]);

  const { handlers, progress } = useLongPress(handleLongPress, 1500);

  const handleShortTap = () => {
    hapticLight();
    setTooltip(true);
    announce('Hold the SOS button for 1.5 seconds to activate emergency services.');
    setTimeout(() => setTooltip(false), 2500);
  };

  const strokeOffset = CIRC - (progress / 100) * CIRC;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px 14px',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
            }}
            role="tooltip"
          >
            🔴 Hold 1.5s to activate SOS
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        aria-label="Emergency SOS — hold for 1.5 seconds to activate"
        aria-live="polite"
        onClick={handleShortTap}
        {...handlers}
        whileTap={{ scale: 0.93 }}
        style={{
          position: 'relative',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 38%, #FF4444, #CC0022)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-red)',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {/* Pulse rings */}
        {progress === 0 && (
          <>
            <span style={{
              position: 'absolute', inset: -8, borderRadius: '50%',
              border: '2px solid rgba(255,23,68,0.50)',
              animation: 'pulse-ring 2s ease-in-out infinite',
            }} />
            <span style={{
              position: 'absolute', inset: -16, borderRadius: '50%',
              border: '1px solid rgba(255,23,68,0.25)',
              animation: 'pulse-ring 2s ease-in-out infinite 0.4s',
            }} />
          </>
        )}

        {/* Progress ring (long press) */}
        {progress > 0 && (
          <svg
            style={{ position: 'absolute', inset: -6, width: 76, height: 76 }}
            viewBox="0 0 76 76"
          >
            <circle cx="38" cy="38" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
            <circle
              cx="38" cy="38" r={RADIUS}
              fill="none"
              stroke="#FF4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 38 38)"
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
        )}

        {/* SOS label */}
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: progress > 0 ? 11 : 13,
          color: '#FFFFFF',
          letterSpacing: '0.06em',
          lineHeight: 1,
          pointerEvents: 'none',
        }}>
          {progress > 0 ? `${Math.round(progress)}%` : 'SOS'}
        </span>
      </motion.button>
    </div>
  );
}
