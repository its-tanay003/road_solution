import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSosStore } from '../store';
import { ShieldAlert, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LiveCore: React.FC = () => {
  const { t } = useTranslation();
  const { isActive, triggerSos, cancelSos } = useSosStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleHoldStart = () => {
    // We could add a long-press logic here, but for now it's immediate
    if (isActive) {
      cancelSos();
    } else {
      triggerSos();
    }
  };

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto my-12">
      {/* Background Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className={`absolute w-32 h-32 rounded-full border-2 ${isActive ? 'border-emergency' : 'border-cyan-500'}`}
        />
        <motion.div
          animate={{
            scale: [1, 1.8, 2.5],
            opacity: [0.3, 0.1, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
          className={`absolute w-32 h-32 rounded-full border ${isActive ? 'border-emergency' : 'border-cyan-500'}`}
        />
      </div>

      {/* Main Core Button */}
      <motion.button
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onTap={handleHoldStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 backdrop-blur-xl transition-colors duration-500 overflow-hidden ${
          isActive 
            ? 'bg-emergency/20 border-emergency shadow-[0_0_80px_rgba(215,38,56,0.6)]' 
            : 'bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.4)]'
        }`}
      >
        {/* Inner Glow */}
        <div className={`absolute inset-0 bg-linear-to-b opacity-50 ${isActive ? 'from-emergency/50 to-transparent' : 'from-cyan-400/30 to-transparent'}`} />

        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center z-10"
            >
              <Radio className="text-emergency mb-2 animate-pulse" size={40} />
              <span className="text-white font-extrabold tracking-widest uppercase text-sm">Cancel SOS</span>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center z-10"
            >
              <ShieldAlert className={`mb-2 transition-colors duration-300 ${isHovered ? 'text-white' : 'text-cyan-400'}`} size={48} />
              <span className="text-white font-extrabold tracking-widest uppercase text-lg">{t('home.sos_button')}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Core highlight reflection */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/20 to-transparent rounded-t-full pointer-events-none" />
      </motion.button>
    </div>
  );
};
