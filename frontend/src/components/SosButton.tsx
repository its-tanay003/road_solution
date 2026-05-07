import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSButton } from '../hooks/useSOSButton';

export const SOSButton: React.FC = () => {
  const { holdProgress, isHolding, sosActive, holdStart, holdEnd, cancelSOS } = useSOSButton();

  // SVG parameters for the progress ring
  const radius = 85;
  const circumference = 2 * Math.PI * radius; // ~534
  const offset = circumference - (holdProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="relative flex items-center justify-center w-[180px] h-[180px]">
        {/* Glow / Pulse Effect */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-[#FF1744]/20 shadow-[0_0_40px_rgba(255,23,68,0.4)]"
          animate={{ scale: isHolding ? [1, 1.15, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />

        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 -rotate-90" width="180" height="180">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
          />
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#FF1744"
            strokeWidth="10"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Main SOS Button */}
        <motion.button
          onPointerDown={holdStart}
          onPointerUp={holdEnd}
          onPointerLeave={holdEnd}
          onTouchStart={holdStart}
          onTouchEnd={holdEnd}
          className="z-10 w-[145px] h-[145px] rounded-full bg-[#FF1744] flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-transform select-none cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
            {holdProgress > 80 ? 'RELEASING...' : 'HOLD FOR'}
          </span>
          <span className="text-4xl font-black tracking-tighter">SOS</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {sosActive && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={cancelSOS}
            className="px-10 py-4 rounded-2xl bg-white/5 text-white font-bold border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors"
          >
            CANCEL EMERGENCY
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
