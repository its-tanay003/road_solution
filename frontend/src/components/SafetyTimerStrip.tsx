import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafetyTimerStore } from '../store/safetyTimerStore';

function fmtMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ── Persistent timer strip (shown on all pages) ─────────────── */
export const SafetyTimerStrip: React.FC = () => {
  const { active, expiresAt, checkIn, graceActive, triggerGrace, fireAlert, stop } = useSafetyTimerStore();
  const [remaining, setRemaining] = useState(0);
  const [grace, setGrace] = useState(30);

  useEffect(() => {
    if (!active || !expiresAt) return;
    const iv = setInterval(() => {
      const left = expiresAt - Date.now();
      setRemaining(left);
      if (left <= 0 && !graceActive) triggerGrace();
    }, 500);
    return () => clearInterval(iv);
  }, [active, expiresAt, graceActive, triggerGrace]);

  useEffect(() => {
    if (!graceActive) {
      requestAnimationFrame(() => setGrace(30));
      return;
    }
    const iv = setInterval(() => {
      setGrace(g => {
        if (g <= 1) { fireAlert(); return 0; }
        return g - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [graceActive, fireAlert]);

  return (
    <>
      {/* green strip */}
      <AnimatePresence>
        {active && !graceActive && (
          <motion.div initial={{ y: -48 }} animate={{ y: 0 }} exit={{ y: -48 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-0 inset-x-0 z-50 h-12 bg-green-600 flex items-center justify-between px-4 shadow-lg">
            <p className="text-white font-bold text-[13px]">
              🛡️ Safety Timer: <span className="font-mono">{fmtMs(remaining)}</span> remaining
            </p>
            <button onClick={checkIn}
              className="px-3 py-1.5 rounded-xl bg-white text-green-700 font-black text-[12px]">
              I'm Safe ✓
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* grace overlay */}
      <AnimatePresence>
        {graceActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 bg-red-950/95 flex flex-col items-center justify-center px-6 gap-6">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}
              className="text-8xl">🚨</motion.div>
            <h1 className="text-4xl font-black text-white text-center">CHECK IN NOW</h1>
            <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-4xl font-black text-white font-mono">{grace}</span>
            </div>
            <p className="text-white/70 text-center text-[16px]">SOS will auto-send to your contacts in {grace} seconds</p>
            <motion.button whileTap={{ scale: 0.94 }} onClick={checkIn}
              className="w-full h-20 rounded-3xl bg-white font-black text-2xl text-red-700">
              ✅ I'M SAFE — CHECK IN
            </motion.button>
            <button onClick={stop} className="text-white/40 text-[13px] underline">Cancel Timer</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
