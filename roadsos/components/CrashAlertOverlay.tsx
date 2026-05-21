'use client';

import { useCrashDetection } from '@/hooks/useCrashDetection';
import { useCrashStore } from '@/lib/store/crashStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, RefreshCw, XCircle } from 'lucide-react';

export function CrashAlertOverlay() {
  const { handleCancel } = useCrashDetection();
  const { crashTriggered, countdownSeconds, triggerReason } = useCrashStore();

  return (
    <AnimatePresence>
      {crashTriggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-red-950 flex flex-col items-center justify-center p-6 text-white"
        >
          {/* Pulsing red background animation */}
          <div className="absolute inset-0 bg-red-900/50 animate-pulse pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-black/40 border border-white/10 rounded-[32px] p-8 text-center backdrop-blur-xl relative z-10 space-y-8 shadow-2xl"
          >
            {/* Warning Icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  borderColor: ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.2)'],
                }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-500"
              >
                <ShieldAlert size={40} className="animate-bounce" />
              </motion.div>
            </div>

            {/* Alert texts */}
            <div className="space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tight text-red-500 animate-pulse">
                Crash Detected
              </h1>
              <p className="text-sm font-semibold tracking-wider uppercase text-gray-400">
                Trigger: <span className="text-white font-extrabold">{triggerReason}</span>
              </p>
              <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed mt-2">
                A sudden force or severe orientation tilt has been recorded. Broadcasting an emergency beacon to responders in:
              </p>
            </div>

            {/* Huge Countdown Ring */}
            <div className="flex justify-center relative items-center py-4">
              {/* Progress Circle SVG */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-red-950 fill-none"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-red-500 fill-none"
                  strokeWidth="10"
                  strokeDasharray={440}
                  animate={{
                    strokeDashoffset: (1 - countdownSeconds / 15) * 440,
                  }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </svg>
              {/* Central Seconds Text */}
              <div className="absolute text-center">
                <span className="text-5xl font-black font-mono tabular-nums leading-none">
                  {countdownSeconds}
                </span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-red-400 mt-1">
                  Seconds
                </span>
              </div>
            </div>

            {/* Large Cancel Button */}
            <motion.button
              onClick={handleCancel}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-5 bg-white text-black font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-gray-150 transition-colors"
            >
              <XCircle size={22} className="text-red-600" />
              I AM OK — CANCEL SOS
            </motion.button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-semibold uppercase">
              <RefreshCw size={12} className="animate-spin" />
              Emergency dispatch is on standby
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
