import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroneStore } from '../store/droneStore';
import { AlertCircle, Maximize2 } from 'lucide-react';

const FINDINGS = [
  "Victim count: 1",
  "Victim status: STATIONARY",
  "Road obstruction: Lane 2 blocked",
  "Emergency access: CLEAR via shoulder"
];

/** Self-contained toast — no external dependency */
const InlineToast: React.FC<{ message: string; onDone: () => void }> = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-[#121826] shadow-2xl"
      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
    >
      <span className="text-lg">🔊</span>
      <span className="text-white">{message}</span>
    </motion.div>
  );
};

export const DroneVideoFeed: React.FC = () => {
  const { status, addAiFinding } = useDroneStore();
  const [visibleFindings, setVisibleFindings] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'LIVE' && visibleFindings.length < FINDINGS.length) {
      const timer = setTimeout(() => {
        const next = FINDINGS[visibleFindings.length];
        setVisibleFindings(prev => [...prev, next]);
        addAiFinding(next);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, visibleFindings, addAiFinding]);

  if (status !== 'LIVE' && status !== 'HOVERING') return null;

  const handleBroadcast = () => {
    setToastMsg("Audio: Help is on the way. Ambulance in 6 minutes.");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#080C14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-6 relative"
      >
        <div className="aspect-video relative overflow-hidden bg-black">
          {/* Mock Static/Noise */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uWUicKgPUV/giphy.gif')] bg-repeat" />

          {/* Scanline Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ y: ['0%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="w-full h-px bg-white/10"
            />
          </div>

          {/* HUD Elements */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="px-2 py-0.5 bg-(--clr-red) text-white text-[8px] font-black uppercase flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
            </div>
            <span className="text-[10px] font-mono text-white/60 tracking-tighter">
              {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="absolute top-4 right-4 text-white/40">
            <Maximize2 size={16} />
          </div>

          {/* Center Target */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-(--clr-red) rounded-full shadow-[0_0_10px_var(--clr-red)]" />
            </div>
            <div className="absolute w-24 h-px bg-white/10" />
            <div className="absolute h-24 w-px bg-white/10" />
          </div>

          {/* AI Findings Overlay */}
          <div className="absolute bottom-4 left-4 space-y-1">
            <AnimatePresence>
              {visibleFindings.map((finding, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 border-l-2 border-(--clr-green)"
                >
                  <div className="w-1 h-1 rounded-full bg-(--clr-green)" />
                  <span className="text-[9px] font-mono text-white uppercase tracking-tighter">{finding}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase">
            <AlertCircle size={14} className="text-(--clr-amber)" />
            AI Scene Analysis Active
          </div>
          <button
            onClick={handleBroadcast}
            title="Broadcast audio message to victim via drone speaker"
            className="px-4 py-2 bg-(--clr-blue) hover:bg-(--clr-blue)/80 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Broadcast to Victim
          </button>
        </div>

        <div className="absolute bottom-0 right-0 p-1 opacity-20 text-[6px] font-mono text-white uppercase pointer-events-none">
          Simulated — DGCA Drone Pilot Programme Ready
        </div>
      </motion.div>

      {/* Inline toast for broadcast confirmation */}
      <AnimatePresence>
        {toastMsg && (
          <InlineToast message={toastMsg} onDone={() => setToastMsg(null)} />
        )}
      </AnimatePresence>
    </>
  );
};
