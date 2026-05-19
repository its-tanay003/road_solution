'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSStore } from '@/lib/store/sosStore';
import { X, MapPin, Radio, Siren, Clock } from 'lucide-react';

export function PanicMode() {
  const { status, countdownSeconds, location, broadcastStatus, responder, cancel, tickCountdown, resolve } = useSOSStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Countdown ticker
  useEffect(() => {
    if (status === 'countdown') {
      intervalRef.current = setInterval(tickCountdown, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, tickCountdown]);

  // Siren audio
  const playSiren = useCallback(() => {
    if (typeof window === 'undefined') return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    gain.gain.value = 0.3;
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 1);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  }, []);

  useEffect(() => {
    if (status === 'active') {
      const id = setInterval(playSiren, 1200);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      return () => clearInterval(id);
    }
  }, [status, playSiren]);

  const visible = status !== 'idle' && status !== 'resolved';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="panic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gray-950/98 backdrop-blur-xl p-6 pt-16"
        >
          {/* Cancel */}
          <div className="w-full flex justify-end">
            {status === 'countdown' && (
              <button
                onClick={cancel}
                className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300"
              >
                <X size={14} /> Cancel SOS
              </button>
            )}
            {(status === 'active' || status === 'acknowledged') && (
              <button
                onClick={resolve}
                className="flex items-center gap-1.5 bg-green-900/50 border border-green-700 rounded-xl px-3 py-2 text-sm text-green-300"
              >
                ✅ I&apos;m Safe — Cancel
              </button>
            )}
          </div>

          {/* Main status */}
          <div className="flex flex-col items-center gap-5 flex-1 justify-center">
            {status === 'countdown' && (
              <>
                <motion.div
                  className="w-32 h-32 rounded-full border-4 border-red-500 flex items-center justify-center"
                  animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0.6)', '0 0 0 30px rgba(239,68,68,0)'] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="text-6xl font-black text-red-500">{countdownSeconds}</span>
                </motion.div>
                <div className="text-center">
                  <p className="text-white font-black text-2xl">SOS Activating</p>
                  <p className="text-gray-400 text-sm mt-1">Broadcasting in {countdownSeconds} seconds</p>
                </div>
              </>
            )}

            {(status === 'active' || status === 'acknowledged') && (
              <>
                <motion.div
                  className="w-28 h-28 rounded-full bg-red-600 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Siren size={48} className="text-white" />
                </motion.div>
                <div className="text-center">
                  <p className="text-red-400 font-black text-2xl">
                    {status === 'acknowledged' ? '🚑 HELP ON THE WAY' : '🔴 SOS ACTIVE'}
                  </p>
                  {location && (
                    <div className="flex items-center gap-1.5 mt-3 text-gray-400 text-sm max-w-[280px] text-center">
                      <MapPin size={13} className="shrink-0 text-red-400" />
                      <span className="truncate">{location.address}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Broadcast status */}
          {broadcastStatus && (
            <div className="w-full max-w-sm space-y-2 mb-4">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Radio size={11} /> Broadcast Channels
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(broadcastStatus).map(([ch, stat]) => (
                  <div
                    key={ch}
                    className={`rounded-xl px-2 py-2 text-center border text-xs font-semibold ${
                      stat === 'sent' || stat === 'broadcast' || stat === 'link_generated'
                        ? 'bg-green-950/50 border-green-700 text-green-300'
                        : stat === 'pending'
                        ? 'bg-yellow-950/50 border-yellow-700 text-yellow-300'
                        : stat === 'stub'
                        ? 'bg-gray-800 border-gray-700 text-gray-400'
                        : 'bg-red-950/50 border-red-800 text-red-400'
                    }`}
                  >
                    {ch}
                    <div className="text-[9px] mt-0.5 opacity-80">{stat}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responder ETA */}
          {responder && (
            <div className="w-full max-w-sm bg-orange-950/50 border border-orange-700 rounded-2xl px-4 py-3 mb-2">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">{responder.name}</p>
                  <p className="text-orange-300 text-sm">ETA: ~{responder.etaMinutes} minutes</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
