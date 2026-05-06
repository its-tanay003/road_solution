import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LOGS = [
  "Initializing mesh network...",
  "Loading India road network (MoRTH 2023)...",
  "Calibrating AI triage engine...",
  "Connecting to 112 India...",
  "Verifying AES-GCM encryption...",
  "System ready."
];

interface Props {
  onComplete: () => void;
}

export const AppLoadingScreen: React.FC<Props> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    if (isSkipped) return;

    // Subtitle delay
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), 800);

    // Logs sequencing
    const logTimers = BOOT_LOGS.map((log, index) => {
      return setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === BOOT_LOGS.length - 1) {
          setTimeout(onComplete, 1000); // Wait 1s after last log
        }
      }, 1000 + index * 300);
    });

    // Auto-skip after 5s total as fallback
    const fallback = setTimeout(onComplete, 5000);

    return () => {
      clearTimeout(subtitleTimer);
      clearTimeout(fallback);
      logTimers.forEach(t => clearTimeout(t));
    };
  }, [onComplete, isSkipped]);

  const handleSkip = () => {
    setIsSkipped(true);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={handleSkip}
      className="fixed inset-0 z-9999 bg-[#080C14] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
    >

      {/* Center Content */}
      <div className="text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 mb-6 relative">
            <div className="absolute inset-0 bg-[#FF1744]/20 blur-xl rounded-full animate-pulse" />
            <img 
              src="/roadsos-logo.svg" 
              alt="ROADSoS" 
              className="w-full h-full relative z-10"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.currentTarget.src = 'https://api.iconify.design/solar:shield-warning-bold-duotone.svg?color=%23FF1744';
              }}
            />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            ROAD<span className="text-[#FF1744]">SoS</span>
          </h1>
          <AnimatePresence>
            {showSubtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-(--clr-text-2) text-sm tracking-[0.3em] uppercase font-medium"
              >
                Emergency Intelligence Platform
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Boot Logs */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-xs px-6">
        <div className="space-y-1.5 font-mono text-[10px]">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className={i === logs.length - 1 && logs.length === BOOT_LOGS.length 
                ? "text-green-500 font-bold" 
                : "text-gray-500"
              }
            >
              <span className="opacity-50 mr-2">&gt;</span>
              {log}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-8 text-[8px] font-mono text-white/10 tracking-widest uppercase">
        Encrypted P2P Mesh Network Protocol v4.2.0-stable
      </div>
      
      {/* Scanline Overlay */}
      <div className="scanline-overlay opacity-30 pointer-events-none" />
    </motion.div>
  );
};
