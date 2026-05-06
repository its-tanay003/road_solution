import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyStore, useDemoStore } from '../store';
import { ShieldCheck, Activity, Timer } from 'lucide-react';

export const GoldenHourCountdown = () => {
  const { goldenHourActive, dispatchConfirmed, setGoldenHourActive } = useEmergencyStore();
  const { incrementStats } = useDemoStore();
  
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [survivalProb, setSurvivalProb] = useState(96.0);
  const [hasFlashed, setHasFlashed] = useState(false);
  const prevDispatchConfirmed = useRef(dispatchConfirmed);

  // Countdown logic
  useEffect(() => {
    if (!goldenHourActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [goldenHourActive]);

  // Survival Probability logic
  useEffect(() => {
    if (!goldenHourActive || dispatchConfirmed) return;

    const probTimer = setInterval(() => {
      setSurvivalProb((prev) => Math.max(5, prev - 0.3));
    }, 15000);

    return () => clearInterval(probTimer);
  }, [goldenHourActive, dispatchConfirmed]);

  // Dispatch Confirmation logic
  useEffect(() => {
    if (dispatchConfirmed && !prevDispatchConfirmed.current) {
      setHasFlashed(true);
      setSurvivalProb((prev) => Math.min(99.9, prev + 5.3));
      incrementStats();
      setTimeout(() => setHasFlashed(false), 1000);
    }
    prevDispatchConfirmed.current = dispatchConfirmed;
  }, [dispatchConfirmed, incrementStats]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProbColor = () => {
    if (survivalProb > 85) return 'text-emerald-400';
    if (survivalProb > 70) return 'text-amber-400';
    return 'text-red-500';
  };

  const statusText = "EMERGENCY RESPONSE INITIATED";

  if (!goldenHourActive) return null;

  return (
    <div className="fixed inset-0 z-9999 pointer-events-none overflow-hidden select-none">
      {/* Dark Red Vignette */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />
      
      {/* Green Flash on Dispatch */}
      <AnimatePresence>
        {hasFlashed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-500 z-10"
          />
        )}
      </AnimatePresence>

      <div className="relative h-full w-full flex flex-col items-center justify-center pointer-events-auto">
        {/* Heartbeat Waveform Animation */}
        <div className="absolute bottom-20 w-full px-20 opacity-30">
          <svg viewBox="0 0 1000 100" className="w-full h-24 stroke-red-600 fill-none">
            <motion.path
              d="M 0 50 L 100 50 L 120 20 L 140 80 L 160 50 L 300 50 L 320 10 L 340 90 L 360 50 L 500 50 L 520 20 L 540 80 L 560 50 L 700 50 L 720 10 L 740 90 L 760 50 L 1000 50"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0.5 }}
              animate={{ 
                pathLength: [0, 1],
                pathOffset: [0, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear"
              }}
            />
          </svg>
        </div>

        {/* Main Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center z-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Activity className="text-red-600" size={32} />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Golden Hour <span className="text-red-600">Active</span>
            </h1>
          </div>

          <motion.div 
            className="bg-black/80 backdrop-blur-3xl border-y border-white/10 py-12 px-20 rounded-3xl shadow-2xl relative overflow-hidden"
            style={{ boxShadow: '0 0 100px rgba(220, 38, 38, 0.2)' }}
          >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-10 bg-grid-white/[0.05]" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Timer size={16} className="text-red-500" />
                <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-black">Time Sensitivity: CRITICAL</span>
              </div>
              
              <h2 className="text-8xl font-black text-white font-mono mb-8 tabular-nums tracking-tighter">
                {formatTime(timeLeft)}
              </h2>

              <div className="space-y-4">
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <motion.div 
                    initial={{ width: '96%' }}
                    animate={{ width: `${survivalProb}%` }}
                    className={`h-full rounded-full ${survivalProb > 85 ? 'bg-emerald-500' : survivalProb > 70 ? 'bg-amber-500' : 'bg-red-600'}`}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Survival Probability</span>
                  <span className={`text-5xl font-black ${getProbColor()} font-mono`}>
                    {survivalProb.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Letter by letter animation */}
          <div className="mt-8 flex gap-1 justify-center">
            {statusText.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, repeat: Infinity, repeatDelay: 5 }}
                className="text-xs font-black text-slate-400 uppercase tracking-widest"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>

          <AnimatePresence>
            {dispatchConfirmed && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-12 flex flex-col items-center gap-4"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500 rounded-[var(--radius-lg)]">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AI Dispatch Confirmed</p>
                    <p className="text-lg font-bold text-white leading-none">Est. 8.3 minutes saved</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="h-px w-12 bg-white/10" />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Optimizing Hospital Route</span>
                  <div className="h-px w-12 bg-white/10" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Button (Internal Demo use) */}
        <div className="absolute bottom-10 flex gap-4">
           <button 
             onClick={() => setGoldenHourActive(false)}
             className="pointer-events-auto px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest transition-all"
           >
             Dismiss Overlay
           </button>
        </div>
      </div>

      <style>{`
        .bg-radial-vignette {
          background: radial-gradient(circle, transparent 40%, rgba(127, 29, 29, 0.8) 100%);
        }
        .bg-grid-white {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 40 L40 40 L40 0' fill='none' stroke='white' stroke-opacity='0.1'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};
