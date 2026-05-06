import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';
import { useEmergencyStore } from '../../store/emergencyStore';

const HOLD_DURATION_MS = 3000;

export function SOSButton() {
  const { sosMode } = useSettingsStore();
  const { triggerSOS, sosState } = useEmergencyStore();
  const [holdProgress, setHoldProgress] = useState(0); // 0-100
  const [isHolding, setIsHolding] = useState(false);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number | null>(null);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHold = useCallback(() => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdInterval.current = null;
    holdStart.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (sosState === 'active') return;
    setIsHolding(true);
    holdStart.current = Date.now();
    // Haptic feedback — start pulse
    if (navigator.vibrate) navigator.vibrate([50]);
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - (holdStart.current ?? Date.now());
      const progress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        clearHold();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        triggerSOS();
      }
    }, 50);
  }, [sosState, clearHold, triggerSOS]);

  // Triple-tap handler for tap3x mode
  const handleTap = useCallback(() => {
    if (sosMode !== 'tap3x') return;
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 800);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      triggerSOS();
    }
  }, [sosMode, triggerSOS]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (sosMode === 'hold3s') startHold();
    else if (sosMode === 'tap3x') handleTap();
  }, [sosMode, startHold, handleTap]);

  const handlePointerUp = useCallback(() => {
    if (sosMode === 'hold3s') clearHold();
  }, [sosMode, clearHold]);

  // Cleanup on unmount
  useEffect(() => () => clearHold(), [clearHold]);

  const isActive = sosState === 'active';
  const isResolved = sosState === 'resolved';
  const circumference = 2 * Math.PI * 90; // radius 90

  return (
    <div style={{ position: 'relative', width: 200, height: 200, userSelect: 'none', flexShrink: 0 }}>
      {/* Idle pulse rings */}
      {!isHolding && !isActive && [0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid rgba(255,23,68,0.3)',
          }}
          animate={{ scale: [1, 1.4, 1.8], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 2.5, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      {/* Progress ring SVG */}
      <svg
        style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
        width="200" height="200" viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="100" cy="100" r="90" fill="none"
          stroke={isActive ? '#8B0000' : '#FF1744'}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - holdProgress / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>

      {/* Main button */}
      <motion.button
        id="sos-button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          background: isResolved ? '#1D9E75' : isActive ? '#8B0000' : isHolding ? '#CC1133' : '#FF1744',
          border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          touchAction: 'none', // Critical — prevents scroll interference on mobile
        }}
        whileTap={{ scale: 0.97 }}
        animate={{ scale: isHolding ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 0.3, repeat: isHolding ? Infinity : 0 }}
        aria-label="SOS Emergency Button — hold for 3 seconds to activate"
        aria-pressed={isActive}
        disabled={isActive}
      >
        <span style={{ fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: 2, lineHeight: 1 }}>
          {isResolved ? '✓' : isActive ? 'SENT' : 'SOS'}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' }}>
          {isResolved
            ? 'Help is coming'
            : isActive
            ? 'Dispatching...'
            : isHolding
            ? `${Math.round(holdProgress)}%`
            : sosMode === 'tap3x'
            ? 'Triple tap'
            : 'Hold 3 seconds'}
        </span>
      </motion.button>
    </div>
  );
}
