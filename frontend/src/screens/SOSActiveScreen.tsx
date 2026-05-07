import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEmergencyStore } from '../store/emergencyStore';
import { useMedicalProfileStore } from '../store/medicalProfileStore';

export const SOSActiveScreen: React.FC = () => {
  const { crashDetectedAt, cancelSOS, sosActive, currentIncidentId } = useEmergencyStore();
  const { name, bloodType } = useMedicalProfileStore();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(10);

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
    <div className="fixed inset-0 bg-[#080C14] z-10000 flex flex-col items-center justify-between p-8 pb-12 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
      
      <div className="mt-12 text-center relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 mb-4"
        >
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Emergency Signal Transmitted</span>
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tighter leading-tight">
          SOS <span className="text-red-600">ACTIVE</span>
        </h1>
        <p className="text-white/40 font-mono text-[10px] tracking-widest mt-2 uppercase">
          Incident: {currentIncidentId}
        </p>
      </div>

      {/* 10s Countdown Circle */}
      <div className="relative flex items-center justify-center">
        <svg className="w-72 h-72 -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="130"
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="16"
          />
          <motion.circle
            cx="144"
            cy="144"
            r="130"
            fill="transparent"
            stroke="#FF1744"
            strokeWidth="16"
            strokeDasharray={2 * Math.PI * 130}
            animate={{ strokeDashoffset: (1 - timeLeft / 10) * (2 * Math.PI * 130) }}
            transition={{ duration: 1, ease: 'linear' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={timeLeft}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-black text-white tracking-tighter"
          >
            {timeLeft}
          </motion.span>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-[-10px]">Seconds</span>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Medical Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Authenticated Identity</p>
              <h3 className="text-2xl font-black text-white tracking-tight">{name || 'Guest User'}</h3>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-red-600 flex items-center justify-center border-4 border-white/10 shadow-lg shadow-red-600/30">
              <span className="text-xl font-black text-white">{bloodType || '??'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Location</p>
              <p className="text-xs font-bold text-white/80">Fetching GPS...</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Dispatcher</p>
              <p className="text-xs font-bold text-red-500 animate-pulse">Contacting 108</p>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            cancelSOS();
            navigate('/');
          }}
          className="w-full bg-white text-[#080C14] py-5 rounded-2xl font-black text-lg tracking-tighter shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
        >
          I AM SAFE — CANCEL
        </motion.button>
      </div>
    </div>
  );
};
