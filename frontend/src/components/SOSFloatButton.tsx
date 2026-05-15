import { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticSOS, hapticLight, announce } from '../lib/accessibilityHelpers';
import './SOSFloatButton.css';

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

  const handleLongPress = useCallback(() => {
    hapticSOS();
    announce('SOS activated. Calling emergency services.', 'assertive');
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
    <div className="sos-float-container">
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="sos-float-tooltip"
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
        className="sos-float-btn"
      >
        {/* Pulse rings */}
        {progress === 0 && (
          <>
            <span className="sos-pulse-ring-inner" />
            <span className="sos-pulse-ring-outer" />
          </>
        )}

        {/* Progress ring (long press) */}
        {progress > 0 && (
          <svg className="sos-progress-svg" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r={RADIUS} className="sos-progress-bg" />
            <circle
              cx="38" cy="38" r={RADIUS}
              className="sos-progress-fill"
              strokeDasharray={CIRC}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 38 38)"
            />
          </svg>
        )}

        {/* SOS label */}
        <span 
          className={`sos-btn-label ${progress > 0 ? 'counting' : ''}`}
        >
          {progress > 0 ? `${Math.round(progress)}%` : 'SOS'}
        </span>
      </motion.button>
    </div>
  );
}
