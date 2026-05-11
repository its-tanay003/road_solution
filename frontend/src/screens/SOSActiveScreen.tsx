import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEmergencyStore } from '../store/emergencyStore';
import { useMedicalProfileStore } from '../store/medicalProfileStore';
import { NotificationStatusPanel } from '../components/NotificationStatusPanel';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const SOSActiveScreen: React.FC = () => {
  const { crashDetectedAt, cancelSOS, sosActive, currentIncidentId } = useEmergencyStore();
  const { profileComplete, name, bloodType } = useMedicalProfileStore();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(10);
  const [showMedicalCard, setShowMedicalCard] = useState(false);

  useEffect(() => {
    // If SOS is not active, we shouldn't be here
    if (!sosActive) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      if (crashDetectedAt) {
        const elapsed = Math.floor((Date.now() - crashDetectedAt) / 1000);
        const remaining = Math.max(0, 10 - elapsed);
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(timer);
          navigate(`/dispatched/${currentIncidentId || 'AUTO'}`);
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [crashDetectedAt, navigate, sosActive, currentIncidentId]);

  return (
    <div className="fixed inset-0 bg-[#080C14] z-10000 flex flex-col items-center p-6 pb-10 overflow-y-auto">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-red-600/5 animate-pulse pointer-events-none" />
      <div className="fixed top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
      
      <div className="mt-8 text-center relative z-10 mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 mb-4"
        >
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Orchestrating Response</span>
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tighter leading-tight">
          SOS <span className="text-red-600">ACTIVE</span>
        </h1>
        <p className="text-white/40 font-mono text-[10px] tracking-widest mt-2 uppercase">
          Incident: {currentIncidentId}
        </p>
      </div>

      {/* 10s Countdown Circle */}
      <div className="relative flex items-center justify-center mb-10 shrink-0">
        <svg className="w-56 h-56 -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="100"
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          <motion.circle
            cx="112"
            cy="112"
            r="100"
            fill="transparent"
            stroke="#FF1744"
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 100}
            animate={{ strokeDashoffset: (1 - timeLeft / 10) * (2 * Math.PI * 100) }}
            transition={{ duration: 1, ease: 'linear' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={timeLeft}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-black text-white tracking-tighter"
          >
            {timeLeft}
          </motion.span>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-[-10px]">Seconds</span>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4 relative z-10">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Dispatch Channels</h3>
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
        </div>
        
        {/* LIVE TRACKER */}
        <NotificationStatusPanel />

        {!profileComplete && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500" />
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed">
              Medical profile incomplete
            </p>
          </div>
        )}

        {/* Collapsible Medical Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl transition-all duration-300">
          <button 
            onClick={() => setShowMedicalCard(!showMedicalCard)}
            className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-600/20 flex items-center justify-center text-red-500 font-black text-xs border border-red-500/30">
                {bloodType || '??'}
              </div>
              <div className="text-left">
                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Medical Identity</p>
                <h4 className="text-sm font-bold text-white tracking-tight">{name || 'Guest User'}</h4>
              </div>
            </div>
            {showMedicalCard ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
          </button>

          <AnimatePresence>
            {showMedicalCard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 border-t border-white/5"
              >
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-0.5">Location</p>
                    <p className="text-[10px] font-bold text-white/80">28.6139° N, 77.2090° E</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-0.5">Telemetry</p>
                    <p className="text-[10px] font-bold text-emerald-500">Live Health Link</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cancel Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            cancelSOS();
            navigate('/');
          }}
          className="w-full bg-white text-[#080C14] py-5 rounded-2xl font-black text-lg tracking-tighter shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 mt-4"
        >
          I AM SAFE — CANCEL
        </motion.button>
      </div>
    </div>
  );
};
