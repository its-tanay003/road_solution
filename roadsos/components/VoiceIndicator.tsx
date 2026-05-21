'use client';

import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useVoiceStore } from '@/lib/store/voiceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VoiceIndicator() {
  const { startListening, stopListening } = useVoiceCommands();
  const { isListening, showGreenFlash, commandText, isCommandMode } = useVoiceStore();

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-24 left-4 z-[999] flex items-center gap-3">
      {/* Tooltip trigger wrapper */}
      <div className="relative group flex items-center">
        {/* Toggle Button */}
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center border shadow-xl relative transition-all duration-300",
            showGreenFlash
              ? "bg-emerald-500 border-emerald-400 text-white"
              : isListening
              ? isCommandMode
                ? "bg-amber-600 border-amber-500 text-white animate-pulse"
                : "bg-red-600 border-red-500 text-white"
              : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
          )}
          aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
        >
          {isListening ? (
            <Mic size={24} className={cn("animate-pulse", showGreenFlash && "hidden")} />
          ) : (
            <MicOff size={24} />
          )}

          {/* Green flash overlay */}
          <AnimatePresence>
            {showGreenFlash && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.8, opacity: [0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full bg-emerald-500"
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Pulse Waves for Listening State */}
        {isListening && !showGreenFlash && (
          <div className="absolute -inset-1.5 rounded-full border border-red-500/20 animate-ping pointer-events-none" />
        )}

        {/* Tooltip */}
        <div className="absolute left-14 bottom-2 w-max max-w-xs scale-0 origin-left transition-all duration-200 group-hover:scale-100 bg-gray-950 border border-gray-800 text-gray-300 text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-lg pointer-events-none z-50">
          {isListening 
            ? "Voice commands active — say 'Show commands' for help"
            : "Voice navigation is offline — tap to activate"}
        </div>
      </div>

      {/* Waveform and command status */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 bg-gray-950/95 border border-gray-850 rounded-2xl px-3 py-2 shadow-2xl backdrop-blur-sm"
          >
            {/* 5 Waveform Bars */}
            <div className="flex items-end gap-[3px] h-3.5 w-6">
              {[1, 2, 3, 4, 5].map((bar) => {
                // Generate different delays/durations for visual asymmetry
                const heights = [
                  [4, 12, 4],
                  [6, 14, 6],
                  [4, 10, 4],
                  [8, 16, 8],
                  [3, 8, 3]
                ];
                return (
                  <motion.div
                    key={bar}
                    className={cn(
                      "w-[3px] rounded-full",
                      showGreenFlash ? "bg-emerald-500" : isCommandMode ? "bg-amber-500" : "bg-red-500"
                    )}
                    animate={{
                      height: heights[bar - 1]
                    }}
                    transition={{
                      duration: 0.6 + bar * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}
            </div>

            {/* Dynamic Status / Command Recognized */}
            <div className="text-[11px] font-bold tracking-tight pr-1">
              {showGreenFlash ? (
                <span className="text-emerald-400 font-extrabold uppercase">
                  ✔ {commandText}
                </span>
              ) : isCommandMode ? (
                <span className="text-amber-400 animate-pulse uppercase">
                  ⚡ Listening...
                </span>
              ) : (
                <span className="text-gray-400 uppercase">
                  Say "Hey Emergency"
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
