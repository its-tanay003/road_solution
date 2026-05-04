import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSosStore, useUIStore } from '../store';

export const EmergencyButton: React.FC = () => {
  const { triggerSos } = useSosStore();
  const { setUxMode, setCrackedScreen } = useUIStore();
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<any>(null);
  const hapticIntervalRef = useRef<any>(null);
  const controls = useAnimation();

  // Gyroscope detection for "Cracked Screen"
  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (acc && acc.z && Math.abs(acc.z) > 15) {
        setCrackedScreen(true);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [setCrackedScreen]);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
    controls.stop();
    controls.set({ strokeDashoffset: 628 }); // Reset circle
  }, [controls]);

  const startHold = useCallback(() => {
    setIsHolding(true);
    controls.start({
      strokeDashoffset: 0,
      transition: { duration: 2, ease: "linear" }
    });

    hapticIntervalRef.current = setInterval(() => {
      if ("vibrate" in navigator) {
        navigator.vibrate(100);
      }
    }, 500);

    holdTimerRef.current = setTimeout(() => {
      stopHold();
      setUxMode('PANIC');
      triggerSos();
    }, 2000);
  }, [controls, setUxMode, triggerSos, stopHold]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Countdown Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="100"
            fill="transparent"
            stroke="rgba(220, 38, 38, 0.2)"
            strokeWidth="12"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="100"
            fill="transparent"
            stroke="#DC2626"
            strokeWidth="12"
            strokeDasharray="628"
            initial={{ strokeDashoffset: 628 }}
            animate={controls}
            strokeLinecap="round"
          />
        </svg>

        {/* SOS Button */}
        <button
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          className={`
            relative z-10 w-48 h-48 rounded-full bg-red-600 
            flex flex-col items-center justify-center shadow-2xl 
            transition-transform active:scale-90 select-none
            ${isHolding ? 'scale-95' : 'scale-100'}
          `}
          style={{ touchAction: 'none' }}
        >
          <span className="text-5xl font-black text-white tracking-tighter">SOS</span>
          <p className="text-red-100 text-[10px] font-black uppercase mt-2 tracking-widest">Hold 2s</p>
        </button>
      </div>
      
      <p className="mt-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs max-w-[200px]">
        Press and hold to trigger emergency protocols
      </p>
    </div>
  );
};
