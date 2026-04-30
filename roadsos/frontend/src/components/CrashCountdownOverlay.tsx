import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XOctagon } from 'lucide-react';
import { useSosStore } from '../store';

const CrashCountdownOverlay: React.FC = () => {
  const { countdownActive, countdownTime, cancelCountdown } = useSosStore();

  if (!countdownActive) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="absolute inset-0 bg-red-900/30 animate-pulse"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md mx-4 bg-[#111] border-2 border-red-500 rounded-3xl p-8 flex flex-col items-center shadow-[0_0_50px_rgba(239,68,68,0.5)]"
      >
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6 animate-ping">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">CRASH DETECTED</h2>
        <p className="text-red-400 text-center mb-8 font-medium">Automatic SOS dispatching in</p>
        
        <div className="text-8xl font-black text-white mb-10 font-mono tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          {countdownTime}
        </div>
        
        <button 
          onClick={cancelCountdown}
          className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex items-center justify-center space-x-2 text-white font-bold transition-colors active:scale-95"
        >
          <XOctagon className="w-5 h-5" />
          <span>I AM OK - CANCEL SOS</span>
        </button>
      </motion.div>
    </div>
  );
};

export default CrashCountdownOverlay;
