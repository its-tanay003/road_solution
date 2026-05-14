import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSosStore } from '../store/sosStore';
import { useUserStore } from '../store/userStore';
import { useWearableStore } from '../store/wearableStore';
import { NotificationStatusPanel } from '../components/NotificationStatusPanel';
import { Activity, Wind } from 'lucide-react';

/* ── constants ─────────────────────────────────────────────── */
const RADIUS = 96;          // SVG circle radius (px inside 220px viewBox)
const CIRC   = 2 * Math.PI * RADIUS;
const TOTAL  = 10;           // countdown seconds

/* ── Haptic loop ────────────────────────────────────────────── */
function useHapticLoop() {
  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    if ('vibrate' in navigator) {
      id = setInterval(() => {
        navigator.vibrate([200, 100, 200, 100]);
      }, 3000);
      navigator.vibrate([200, 100, 200, 100]);
    }
    return () => clearInterval(id);
  }, []);
}

/* ── background red particle canvas ────────────────────────── */
function RedWashBackground() {
  return (
    <>
      <div className="fixed inset-0 bg-base" />
      <motion.div
        className="fixed inset-0 pointer-events-none bg-red/10"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* top/bottom gradient bars */}
      <div className="fixed top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-red/80 to-transparent" />
      <div className="fixed bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-red/50 to-transparent" />
      {/* corner aura */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-red/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-64 h-64 bg-red/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
    </>
  );
}

/* ── countdown SVG ring ─────────────────────────────────────── */
function CountdownRing({ timeLeft }: { timeLeft: number }) {
  const offset = CIRC * (1 - timeLeft / TOTAL);
  return (
    <div className="relative flex items-center justify-center w-[220px] h-[220px]">
      <svg width={220} height={220} className="-rotate-90">
        {/* track */}
        <circle cx={110} cy={110} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        {/* progress */}
        <motion.circle
          cx={110} cy={110} r={RADIUS}
          fill="none"
          stroke="var(--red)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
        {/* glow ring */}
        <motion.circle
          cx={110} cy={110} r={RADIUS}
          fill="none"
          stroke="var(--red)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animate={{ strokeDashoffset: offset, opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, ease: 'linear', opacity: { repeat: Infinity, duration: 0.7 } }}
          className="blur-[4px]"
        />
      </svg>

      {/* centre content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={timeLeft}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-mono font-black text-white leading-none text-[72px]"
          >
            {timeLeft}
          </motion.span>
        </AnimatePresence>
        <span className="font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase">
          Seconds
        </span>
      </div>
    </div>
  );
}

/* ── main screen ─────────────────────────────────────────────── */
export const SOSActiveScreen: React.FC = () => {
  const navigate    = useNavigate();
  const { isActive, cancelSOS, incidentId, crashDetectedAt } = useSosStore();
  const { name, medicalInfo } = useUserStore();
  const wearable    = useWearableStore(s => s.health);
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const resolved    = useRef(false);

  useHapticLoop();

  // redirect guard
  useEffect(() => {
    if (!isActive) navigate('/', { replace: true });
  }, [isActive, navigate]);

  // countdown
  useEffect(() => {
    if (!crashDetectedAt) return;
    const id = setInterval(() => {
      const elapsed    = Math.floor((Date.now() - crashDetectedAt) / 1000);
      const remaining  = Math.max(0, TOTAL - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0 && !resolved.current) {
        resolved.current = true;
        clearInterval(id);
        navigate(`/dispatched/${incidentId || 'AUTO'}`);
      }
    }, 200);
    return () => clearInterval(id);
  }, [crashDetectedAt, navigate, incidentId]);

  const handleCancel = useCallback(() => {
    if ('vibrate' in navigator) navigator.vibrate([50]);
    cancelSOS();
    navigate('/', { replace: true });
  }, [cancelSOS, navigate]);

  const bloodType = medicalInfo?.bloodGroup || 'Unknown';
  const userName  = name || 'Unknown User';
  const hasHR     = wearable?.bpmHistory?.length > 0;
  const lastHR    = hasHR ? wearable.bpmHistory[wearable.bpmHistory.length - 1]?.value : null;

  return (
    <>
      <RedWashBackground />

      <main
        className="relative z-10 min-h-screen flex flex-col items-center px-5 pb-10 pt-8 overflow-y-auto font-mono"
        aria-live="assertive"
        role="alert"
      >
        {/* TOP — incident ID */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-text-secondary tracking-[0.25em] uppercase mb-6 self-start"
        >
          Incident&nbsp;
          <span className="text-red">{incidentId || 'AUTO'}</span>
        </motion.div>

        {/* blinking header */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-blink text-[15px] font-black tracking-[0.3em] text-red uppercase mb-2 text-center"
          aria-label="Emergency alert sending"
        >
          ⚠ Emergency Alert Sending
        </motion.h1>

        {/* profile line */}
        <p className="text-text-secondary text-[13px] tracking-widest mb-8 text-center">
          {userName}&nbsp;&nbsp;•&nbsp;&nbsp;Blood Type:&nbsp;
          <span className="text-red font-black">{bloodType}</span>
        </p>

        {/* COUNTDOWN RING */}
        <CountdownRing timeLeft={timeLeft} />

        {/* spacer */}
        <div className="my-6" />

        {/* wearable vitals mini strip */}
        {lastHR && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-red/10 border border-red/20 mb-6 text-[12px]"
          >
            <Activity size={14} className="text-red" />
            <span className="text-text-secondary">HR: <span className="text-red font-black">{lastHR} ↑</span></span>
            <span className="w-px h-4 bg-white/10" />
            <Wind size={14} className="text-blue" />
            <span className="text-text-secondary">SpO₂: <span className="text-blue font-black">{wearable.spO2 ?? 92}%</span></span>
          </motion.div>
        )}

        {/* NOTIFICATION STATUS */}
        <div className="w-full max-w-sm space-y-4 mb-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-black">Dispatch Channels</h2>
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-ping" />
          </div>
          <NotificationStatusPanel />
        </div>

        {/* CANCEL CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCancel}
          className="w-full max-w-sm h-16 rounded-2xl border-2 border-white/20 text-white font-black text-[18px] tracking-tight
                     bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all duration-200
                     flex items-center justify-center gap-3 mb-4"
          aria-label="Cancel SOS — I am safe"
        >
          ✓ I AM SAFE — CANCEL
        </motion.button>

        {/* contact count */}
        <p className="text-text-secondary text-[11px] tracking-widest text-center">
          Alerting all emergency contacts…
        </p>
      </main>
    </>
  );
};

export default SOSActiveScreen;
