import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ECGWaveformProps {
  status: 'NORMAL' | 'AFIB' | 'INCONCLUSIVE';
  className?: string;
}

export const ECGWaveform: React.FC<ECGWaveformProps> = ({ status, className }) => {
  const points = useMemo(() => {
    // Basic P-QRS-T wave pattern
    // Normal: P (small), Q (small dip), R (sharp peak), S (sharp dip), T (medium)
    const normalPattern = [
      { x: 0, y: 50 }, { x: 10, y: 50 },
      { x: 15, y: 45 }, { x: 20, y: 50 }, // P wave
      { x: 25, y: 50 }, { x: 28, y: 55 }, // Q wave
      { x: 32, y: 10 }, // R wave (peak)
      { x: 36, y: 70 }, // S wave (dip)
      { x: 40, y: 50 },
      { x: 50, y: 40 }, { x: 60, y: 50 }, // T wave
      { x: 70, y: 50 }, { x: 80, y: 50 }
    ];

    const afibPattern = [
      { x: 0, y: 50 }, { x: 5, y: 52 }, { x: 10, y: 48 }, { x: 15, y: 51 }, // Fibrillation waves
      { x: 18, y: 55 }, { x: 22, y: 10 }, { x: 26, y: 70 }, // Irregular QRS
      { x: 30, y: 50 }, { x: 35, y: 45 }, { x: 40, y: 55 },
      { x: 45, y: 15 }, { x: 48, y: 65 }, // Rapid QRS
      { x: 55, y: 50 }, { x: 60, y: 50 },
      { x: 65, y: 12 }, { x: 70, y: 75 }, // Another irregular QRS
      { x: 80, y: 50 }
    ];

    const activePattern = status === 'AFIB' ? afibPattern : normalPattern;
    
    // Scale and generate path
    return activePattern.map(p => `${p.x * 4},${p.y}`).join(' ');
  }, [status]);

  return (
    <div className={`relative bg-nx-bg-surface border border-nx-border rounded-(--radius-lg) overflow-hidden h-32 ${className}`}>
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff3b3b_1px,transparent_1px)] bg-size-[20px_20px]" />
      
      <svg viewBox="0 0 320 100" className="w-full h-full preserve-3d">
        <defs>
          <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0" />
            <stop offset="50%" stopColor="#ff3b3b" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff3b3b" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* The Wave */}
        <motion.polyline
          points={points}
          fill="none"
          stroke="url(#ecgGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1, 1],
            pathOffset: [0, 0, 1],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: status === 'AFIB' ? 1 : 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Status Overlay */}
        {status === 'AFIB' && (
          <motion.text
            x="10" y="25"
            className="text-[10px] font-black fill-nx-red-primary uppercase italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            ATRIAL FIBRILLATION DETECTED
          </motion.text>
        )}
      </svg>
      
      <div className="absolute bottom-2 right-3 flex items-center gap-2">
        <div className="relative">
          <div className="w-1.5 h-1.5 rounded-full bg-linear-to-br from-white/20 to-transparent" />
          <div className={`absolute inset-0 w-1.5 h-1.5 rounded-full animate-pulse ${status === 'AFIB' ? 'bg-nx-red-primary' : 'bg-nx-blue-primary'}`} />
        </div>
        <span className="text-[8px] font-black text-nx-text-tertiary uppercase tracking-widest">
          {status === 'AFIB' ? 'Irregular Sinus Rhythm' : 'Normal Sinus Rhythm'}
        </span>
      </div>
    </div>
  );
};
