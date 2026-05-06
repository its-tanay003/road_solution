import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSettingsStore } from '../store/settingsStore';

interface SOSButtonProps {
  onActivate: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onActivate }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const { hapticFeedback, sosMode } = useSettingsStore();
  const timerRef = useRef<number | null>(null);
  const controls = useAnimation();

  const handleStart = () => {
    if (sosMode !== 'hold3s') return;
    setIsHolding(true);
    setProgress(0);
    
    const startTime = Date.now();
    const duration = 3000;

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(nextProgress);

      if (hapticFeedback && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      if (nextProgress === 100) {
        window.clearInterval(timerRef.current!);
        onActivate();
        setIsHolding(false);
        setProgress(0);
      }
    }, 50) as unknown as number;
  };

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsHolding(false);
    setProgress(0);
  };

  // SVG Progress Ring calculations
  const radius = 94;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulsing ring */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.05, 0.15]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-[280px] h-[280px] bg-[var(--color-emergency)] rounded-full"
      />

      {/* Middle static ring */}
      <div className="absolute w-[240px] h-[240px] border-2 border-[var(--color-emergency)]/40 rounded-full" />

      {/* Main Button */}
      <motion.button
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
        animate={controls}
        whileTap={{ scale: 0.95 }}
        className="sos-button-outer z-10"
        aria-label="SOS Emergency Button. Press and hold for 3 seconds."
      >
        {/* Progress Arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="white"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-75 ${isHolding ? 'opacity-100' : 'opacity-0'}`}
          />
        </svg>

        <div className="sos-button-inner">
          <span className="text-5xl font-black font-rajdhani tracking-tighter mb-1">SOS</span>
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">
            {isHolding ? 'RELEASE TO CANCEL' : 'PRESS & HOLD'}
          </span>
        </div>
      </motion.button>
    </div>
  );
};
