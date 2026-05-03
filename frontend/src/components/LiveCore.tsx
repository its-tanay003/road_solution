import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSosStore } from '../store';
import { ShieldAlert, Radio, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LiveCore: React.FC = () => {
  const { t } = useTranslation();
  const { isActive, triggerSos, cancelSos } = useSosStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleHoldStart = () => {
    if (isActive) {
      cancelSos();
    } else {
      triggerSos();
    }
  };

  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* Background Radar Rings - Tactical Style */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 2],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 1,
            }}
            className={`absolute w-40 h-40 rounded-full border ${isActive ? 'border-[var(--nx-red-primary)]' : 'border-[var(--nx-border-active)]'}`}
          />
        ))}
        
        {/* Scanning Sweep */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-72 h-72 rounded-full border border-white/[0.05]"
          style={{ 
            background: 'conic-gradient(from 0deg, var(--nx-red-primary) 0%, transparent 10%, transparent 100%)',
            opacity: isActive ? 0.3 : 0.05
          }}
        />
      </div>

      {/* Main Tactical Core */}
      <motion.button
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onTap={handleHoldStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 w-48 h-48 rounded-sm flex flex-col items-center justify-center transition-all duration-500 overflow-hidden group ${
          isActive 
            ? 'bg-[var(--nx-red-dim)] border-2 border-[var(--nx-red-primary)] shadow-[0_0_50px_rgba(255,59,59,0.3)]' 
            : 'bg-[var(--nx-bg-surface)] border-2 border-[var(--nx-border)] shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-[var(--nx-border-active)]'
        }`}
      >
        {/* Digital Corner Brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/20" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/20" />

        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center z-10"
            >
              <Radio className="text-[var(--nx-red-primary)] mb-3 animate-pulse" size={48} />
              <span className="text-white font-black tracking-[0.2em] uppercase text-xs">DISENGAGE</span>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center z-10"
            >
              <div className="relative mb-4">
                <ShieldAlert className={`transition-all duration-300 ${isHovered ? 'text-[var(--nx-red-primary)] scale-110' : 'text-white/60'}`} size={56} />
                {isHovered && (
                  <motion.div 
                    layoutId="glow"
                    className="absolute inset-0 bg-[var(--nx-red-primary)] blur-xl opacity-20"
                  />
                )}
              </div>
              <span className="text-white font-black tracking-[0.3em] uppercase text-sm">TRIGGER SOS</span>
              <div className="mt-2 flex items-center gap-1.5">
                 <Zap size={10} className="text-[var(--nx-amber-primary)]" />
                 <span className="text-[9px] text-[var(--nx-text-tertiary)] uppercase font-bold">Neural Link Ready</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tactical Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_3px)]" />
      </motion.button>
    </div>
  );
};
