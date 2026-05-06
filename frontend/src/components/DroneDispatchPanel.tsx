import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDroneStore } from '../store/droneStore';
import type { DroneStatus } from '../store/droneStore';
import { CheckCircle2, Navigation, Radio, Activity, Eye } from 'lucide-react';

const STATUS_CONFIG: Record<DroneStatus, { label: string; icon: React.ElementType; color: string }> = {
  IDLE: { label: 'Standby', icon: Radio, color: 'text-gray-400' },
  TAKEOFF: { label: 'Takeoff — Chennai Guindy Hub', icon: Navigation, color: 'text-(--clr-green)' },
  CRUISING: { label: 'Altitude: 120m AGL — cruising', icon: Activity, color: 'text-(--clr-green)' },
  EN_ROUTE: { label: 'En route — 1.4km remaining', icon: Navigation, color: 'text-(--clr-blue)' },
  HOVERING: { label: 'Hovering over incident scene', icon: Radio, color: 'text-(--clr-amber)' },
  LIVE: { label: 'Visual feed transmitting', icon: Eye, color: 'text-(--clr-red)' },
};

export const DroneDispatchPanel: React.FC = () => {
  const { isDispatched, status, eta, setStatus, updateEta } = useDroneStore();

  // Track ETA via ref to avoid stale closure in setInterval
  const etaRef = useRef(eta);
  useEffect(() => { etaRef.current = eta; }, [eta]);

  useEffect(() => {
    if (!isDispatched) return;

    const sequence = async () => {
      await new Promise(r => setTimeout(r, 3000));
      setStatus('CRUISING');
      await new Promise(r => setTimeout(r, 7000));
      setStatus('EN_ROUTE');
      await new Promise(r => setTimeout(r, 84000));
      setStatus('HOVERING');
      await new Promise(r => setTimeout(r, 2000));
      setStatus('LIVE');
    };

    sequence();

    const timer = setInterval(() => {
      updateEta(Math.max(0, etaRef.current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isDispatched, setStatus, updateEta]);

  if (!isDispatched) return null;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0F1A] border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-8 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--clr-green)/20 flex items-center justify-center border border-(--clr-green)/30 relative">
            <Radio size={20} className="text-(--clr-green)" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-(--clr-green) rounded-full animate-pulse border-2 border-[#0A0F1A]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">Autonomous Drone Dispatched</h3>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ROADSoS Recon DR-1 | ETA {formatTime(eta)}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-(--clr-green)">ETA {formatTime(eta)}</span>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">DR-1 Payload: Camera + Speaker</span>
          <span className="text-[10px] font-mono text-(--clr-green)">Chennai Guindy Hub</span>
        </div>
        
        <div className="space-y-4">
          {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'IDLE').map(([k, cfg], idx) => {
            const isActive = status === k;
            const isPast = Object.keys(STATUS_CONFIG).indexOf(status) > Object.keys(STATUS_CONFIG).indexOf(k);
            
            if (Object.keys(STATUS_CONFIG).indexOf(k) > Object.keys(STATUS_CONFIG).indexOf(status)) return null;

            return (
              <motion.div 
                key={k}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {isPast ? (
                    <CheckCircle2 size={16} className="text-(--clr-green)" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-(--clr-blue) animate-pulse' : 'border-white/10'}`}>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-(--clr-blue)" />}
                    </div>
                  )}
                  <span className={`text-[11px] font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>
                    {cfg.label}
                  </span>
                </div>
                {isPast && (
                  <span className="text-[8px] font-black text-(--clr-green) uppercase tracking-tighter">Confirmed</span>
                )}
                {isActive && k === 'EN_ROUTE' && (
                  <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 84 }}
                      className="h-full bg-(--clr-blue)"
                    />
                  </div>
                )}
                {isActive && k === 'LIVE' && (
                  <span className="px-1.5 py-0.5 rounded bg-(--clr-red) text-white text-[8px] font-black uppercase animate-pulse">Live</span>
                )}
                {isActive && k === 'HOVERING' && (
                  <span className="px-1.5 py-0.5 rounded bg-(--clr-amber) text-black text-[8px] font-black uppercase">Active</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] italic">
        <Radio size={12} /> Simulated — DGCA Drone Pilot Programme Ready
      </div>
    </motion.div>
  );
};
