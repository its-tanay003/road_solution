import React, { useEffect, useState, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useEmergencyStore } from '../store';
import { HospitalETAList } from './HospitalETAList';
import { Timer, AlertTriangle } from 'lucide-react';

export const GoldenHourTimer: React.FC = () => {
  const { crashDetectedAt, setGoldenHourExpired } = useEmergencyStore();
  const [timeLeft, setTimeLeft] = useState<number>(3600); // 60 minutes in seconds
  const controls = useAnimation();

  useEffect(() => {
    if (!crashDetectedAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - crashDetectedAt) / 1000);
      const remaining = Math.max(0, 3600 - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setGoldenHourExpired(true);
        clearInterval(interval);
      }
    }, 100); // Higher frequency for smooth SVG transition

    return () => clearInterval(interval);
  }, [crashDetectedAt, setGoldenHourExpired]);

  // Framer Motion Effects
  useEffect(() => {
    // Pulse every 30s
    if (timeLeft > 0 && timeLeft % 30 === 0) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 }
      });
    }

    // Violent shake under 5min (300s)
    if (timeLeft > 0 && timeLeft < 300) {
      controls.start({
        x: [0, -2, 2, -2, 2, 0],
        transition: { duration: 0.2, repeat: Infinity }
      });
    } else {
      controls.stop();
    }
  }, [timeLeft, controls]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = timeLeft / 3600;
  
  const timerColor = useMemo(() => {
    if (minutes >= 40) return '#22c55e'; // green-500
    if (minutes >= 20) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  }, [minutes]);

  // SVG ring properties
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl">
      <div className="relative flex items-center justify-center">
        {/* SVG Ring */}
        <svg className="w-64 h-64 -rotate-90 transform">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress circle */}
          <motion.circle
            cx="128"
            cy="128"
            r={radius}
            stroke={timerColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ ease: "linear", duration: 0.1 }}
            strokeLinecap="round"
            fill="transparent"
            style={{ filter: timeLeft < 300 ? 'drop-shadow(0 0 8px #ef4444)' : 'none' }}
          />
        </svg>

        {/* Center Text */}
        <motion.div 
          animate={controls}
          className="absolute flex flex-col items-center"
        >
          <div className={`text-sm font-black tracking-widest mb-1 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
            GOLDEN HOUR
          </div>
          <div 
            className="text-5xl font-bold tracking-tighter"
            style={{ fontFamily: '"JetBrains Mono", monospace', color: timerColor }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          {timeLeft < 300 && (
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
              <AlertTriangle className="w-3 h-3" />
              Critical Window
            </div>
          )}
        </motion.div>
      </div>

      <HospitalETAList remainingMinutes={minutes} />
      
      <div className="flex items-center gap-4 text-white/40">
        <div className="h-[1px] w-12 bg-white/10" />
        <Timer className="w-4 h-4" />
        <div className="h-[1px] w-12 bg-white/10" />
      </div>
    </div>
  );
};
