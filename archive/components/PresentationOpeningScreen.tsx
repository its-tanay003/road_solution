import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const PresentationOpeningScreen: React.FC = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState(0); // 0: Start, 1: Family, 2: Stats, 3: RoadSoS
  const audioContextRef = useRef<AudioContext | null>(null);
  const requestRef = useRef<number>(0);

  // Heartbeat Sound Logic
  const playHeartbeat = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioContextRef.current = new AudioContextClass();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  // Lifecycle & Counter Logic
  useEffect(() => {
    const start = Date.now();
    
    const tick = () => {
      const elapsed = Date.now() - start;
      
      // Update count: 1.35M per year = 1 every ~23.3 seconds
      const currentCount = Math.floor(elapsed / 23300);
      if (currentCount > count) {
        setCount(currentCount);
        playHeartbeat();
      }

      // Timing stages
      if (elapsed >= 25000 && stage === 0) setStage(1);
      if (elapsed >= 30000 && stage === 1) setStage(2);
      if (elapsed >= 33000 && stage === 2) setStage(3);
      if (elapsed >= 37000) navigate('/'); // Auto-transition

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    // Initial heartbeat interval (60 BPM)
    const hbInterval = setInterval(() => {
      if (stage < 3) playHeartbeat();
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') navigate('/');
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearInterval(hbInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [count, stage, navigate]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white font-sans select-none overflow-hidden cursor-none">
      
      {/* Precision Counter */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        className="text-center space-y-2 z-10"
      >
        <div className="text-slate-500 text-[10px] uppercase tracking-[0.5em] font-black mb-4">
          Global Monitoring System | Incident Frequency: 23s
        </div>
        <div className="text-8xl md:text-9xl font-black italic tracking-tighter tabular-nums flex items-center justify-center gap-4">
          <span className="text-slate-800">00</span>
          <span>{count}</span>
        </div>
        <div className="text-xs font-mono text-slate-400 mt-4 tracking-widest uppercase">
          Road deaths in the last 60 seconds
        </div>
      </motion.div>

      {/* Narrative Stages */}
      <div className="absolute bottom-1/4 w-full text-center space-y-6 px-12">
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-2xl md:text-3xl font-light tracking-tight text-slate-300 italic"
            >
              "That person had a family."
            </motion.div>
          )}

          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-2"
            >
              <div className="text-slate-500 text-sm uppercase tracking-widest font-bold">
                The average emergency response took 17 minutes.
              </div>
              <div className="text-red-500 text-xl font-black uppercase tracking-tighter">
                They had 8 minutes.
              </div>
            </motion.div>
          )}

          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="pt-12"
            >
              <div className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-blue-500 glow-blue">
                ROADSoS changes this.
              </div>
              <div className="text-[10px] text-slate-600 mt-4 uppercase tracking-[0.4em] font-bold animate-pulse">
                Transitioning to Active Intelligence...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* EKG / Heartbeat Line */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <motion.path
            d="M0,50 L450,50 L460,20 L470,80 L480,10 L490,90 L500,50 L1000,50"
            fill="none"
            stroke="white"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1],
              opacity: count > 0 ? [0.2, 1, 0.2] : 0.1,
              x: [-10, 0, 10]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>
      </div>

      <style>{`
        .glow-blue {
          text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
        }
      `}</style>

    </div>
  );
};
