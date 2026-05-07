import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = ["Initializing AI Core...", "GPS Active", "System Ready"];

  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev < statuses.length - 1 ? prev + 1 : prev));
    }, 600);
    
    return () => {
      clearTimeout(timer);
      clearInterval(statusInterval);
    };
  }, [onComplete, statuses.length]);

  const letterVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } }}
      className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden font-inter"
    >
      {/* 1. Single red dot animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1, 1], 
          opacity: [0, 1, 0],
          transition: { duration: 0.8, times: [0, 0.5, 1] }
        }}
        className="w-4 h-4 bg-(--color-emergency) rounded-full absolute"
      />

      {/* 2. Expanding circle (shattering effect implied by next steps) */}
      <motion.div
        initial={{ scale: 0, opacity: 0, border: '2px solid var(--sos-red)' }}
        animate={{ 
          scale: 4, 
          opacity: [0, 0.5, 0],
          transition: { duration: 0.6, delay: 0.4 }
        }}
        className="w-24 h-24 rounded-full absolute"
      />

      {/* 3. Letters assembly */}
      <div className="flex items-center gap-1 mb-4 z-10">
        <motion.div 
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1, delayChildren: 1.0 }}
          className="flex text-5xl md:text-7xl font-extrabold tracking-tighter"
        >
          {['R', 'O', 'A', 'D'].map((l, i) => (
            <motion.span key={i} variants={letterVariants} className="text-white">{l}</motion.span>
          ))}
          <motion.span variants={letterVariants} className="text-(--color-emergency)">S</motion.span>
          {['o', 'S'].map((l, i) => (
            <motion.span key={i + 5} variants={letterVariants} className="text-white">{l}</motion.span>
          ))}
        </motion.div>
      </div>

      {/* 4. Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="text-cyan text-xs md:text-sm uppercase tracking-[0.3em] font-medium mb-16"
      >
        Emergency Intelligence. India's Guardian.
      </motion.p>

      {/* 5. Status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-16 flex flex-col items-center gap-4"
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-cyan rounded-full"
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={statusIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-text-muted text-xs uppercase tracking-widest font-rajdhani"
          >
            {statuses[statusIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
