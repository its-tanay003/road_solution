import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FamilyStatusPanel } from '../components/FamilyStatusPanel';
import { useSosStore } from '../store';
import { useOfflineTriage } from '../hooks/useOfflineTriage';
import { OfflineTriageBadge } from '../components/OfflineTriageBadge';
import { VaahanLookup } from '../components/VaahanLookup';
import { DispatchCard } from '../components/DispatchCard';
import type { TriageInput } from '../logic/offlineTriageEngine';

export const SOSActive: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cancelSos, 
    location, 
    dispatch108, 
    countdownTime, 
    decrementCountdown, 
    isActive 
  } = useSosStore();

  // Simulated telemetry for triage
  const mockTelemetry: TriageInput = {
    gForce: 12.4,
    movement: false,
    spO2: 86,
    heartRate: 142,
    crashType: 'urban',
    vehicleType: 'car'
  };

  const { isOffline, triageResult } = useOfflineTriage(mockTelemetry);

  useEffect(() => {
    const timer = setInterval(() => {
      decrementCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, [decrementCountdown]);

  // Auto-navigate when countdown hits 0 or dispatch is confirmed
  useEffect(() => {
    if (isActive && countdownTime <= 0) {
      navigate('/dispatched');
    }
  }, [isActive, countdownTime, navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-(--clr-bg) flex flex-col items-center justify-start p-6 overflow-y-auto custom-scrollbar">
      <div className="scanline-overlay opacity-20" />
      
      {/* Background Pulsing Grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(var(--clr-red)_1px,transparent_1px)] bg-size-[40px_40px]" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm relative z-10 flex flex-col items-center text-center pb-12"
      >
        <div className="mt-8 mb-8 relative">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-(--clr-red)/20 rounded-full blur-2xl"
          />
          <div className="w-20 h-20 rounded-full bg-(--clr-red)/20 border-2 border-(--clr-red) flex items-center justify-center text-(--clr-red) shadow-[0_0_30px_var(--clr-glow-red)]">
            <ShieldAlert size={40} className="animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">SOS ACTIVE</h1>
        <p className="text-(--clr-red) font-mono text-[10px] tracking-[0.4em] mb-8 uppercase">Transmitting Emergency Payload</p>

        {/* Triage Status */}
        <div className="w-full mb-6">
          <AnimatePresence mode="wait">
            {isOffline && triageResult ? (
              <OfflineTriageBadge result={triageResult} />
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-5 rounded-2xl bg-(--clr-blue)/5 border-2 border-(--clr-blue) text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-(--clr-blue) animate-ping" />
                    <span className="text-[10px] font-mono text-(--clr-blue) uppercase tracking-widest font-bold">AI Triage Active</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono text-white/40 uppercase">G-Force</span>
                    <span className="text-sm font-bold text-white">12.4G</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono text-white/40 uppercase">SpO2</span>
                    <span className="text-sm font-bold text-(--clr-red)">86%</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono text-white/40 uppercase">Heart Rate</span>
                    <span className="text-sm font-bold text-(--clr-red)">142</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VAAHAN Lookup */}
        <div className="w-full mb-6">
          <VaahanLookup />
        </div>

        {/* 108 Dispatch Tracking */}
        <div className="w-full mb-6">
          <DispatchCard />
        </div>

        <div className="w-full grid grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-(--clr-border) text-left">
            <p className="text-[10px] font-mono text-(--clr-text-2) mb-1 flex items-center gap-1.5"><MapPin size={10} /> LAT</p>
            <p className="text-xs font-mono text-white">{location?.lat?.toFixed(5) || 'Searching...'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-(--clr-border) text-left">
            <p className="text-[10px] font-mono text-(--clr-text-2) mb-1 flex items-center gap-1.5"><MapPin size={10} /> LNG</p>
            <p className="text-xs font-mono text-white">{location?.lng?.toFixed(5) || 'Searching...'}</p>
          </div>
        </div>

        {!dispatch108 && (
          <div className="w-full p-6 rounded-3xl bg-white/5 border border-(--clr-border) mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-(--clr-green) animate-ping" />
                <span className="text-[10px] font-mono text-(--clr-green) tracking-widest uppercase">Dispatcher Connected</span>
              </div>
              <span className="text-sm font-mono text-white">{Math.floor(countdownTime / 60)}:{(countdownTime % 60).toString().padStart(2, '0')}</span>
            </div>
            
            <div className="text-left space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">112 EMERGENCY LINE</p>
                  <p className="text-[10px] text-(--clr-text-2)">Automatic hand-off in {countdownTime}s</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full flex flex-col gap-4">
          <FamilyStatusPanel 
            incidentId="RS-2026-CH-9921" 
            location={location || { lat: 13.0827, lng: 80.2707 }} 
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              cancelSos();
              navigate('/');
            }}
            className="w-full py-4 border border-white/10 rounded-xl font-mono text-[10px] tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            CANCEL SOS SIGNAL
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
