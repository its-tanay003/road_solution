import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigation, Clock, ShieldCheck, Phone, Siren, Activity, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VaahanLookup } from '../components/VaahanLookup';
import { useOfflineTriage } from '../hooks/useOfflineTriage';
import { OfflineTriageBadge } from '../components/OfflineTriageBadge';
import { DroneDispatchPanel } from '../components/DroneDispatchPanel';
import { useDroneStore } from '../store/droneStore';

export const Dispatched: React.FC = () => {
  const [eta, setEta] = useState(6);
  const [distance, setDistance] = useState(2.4);
  const { dispatchDrone } = useDroneStore();

  const mockTelemetry = {
    gForce: 12.4,
    movement: false,
    spO2: 86,
    heartRate: 142,
    crashType: 'urban' as const,
    vehicleType: 'car' as const
  };

  const { isOffline, triageResult } = useOfflineTriage(mockTelemetry);

  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => Math.max(1, prev - 0.1));
      setDistance(prev => Math.max(0.1, prev - 0.05));
    }, 10000);

    // Trigger drone dispatch after 90 seconds
    const droneTimer = setTimeout(() => {
      dispatchDrone();
    }, 90000);

    return () => {
      clearInterval(timer);
      clearTimeout(droneTimer);
    };
  }, [dispatchDrone]);

  return (
    <div className="min-h-screen bg-(--clr-bg) text-white font-ui p-6 relative overflow-hidden flex flex-col items-center">
      <div className="scanline-overlay opacity-20" />
      
      {/* HUD Background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 w-full h-px bg-linear-to-r from-transparent via-(--clr-green) to-transparent" />
        <div className="absolute bottom-0 w-full h-px bg-linear-to-r from-transparent via-(--clr-green) to-transparent" />
      </div>

      <header className="w-full max-w-sm flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--clr-green)/20 flex items-center justify-center text-(--clr-green) border border-(--clr-green)/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">ALS_UNIT_092</h1>
            <p className="text-[10px] font-mono text-(--clr-green) uppercase tracking-widest">En Route to Scene</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">GOLDEN_HR</p>
          <p className="text-sm font-bold text-(--clr-amber)">44:12</p>
        </div>
      </header>

      <main className="w-full max-w-sm space-y-6 relative z-10 pb-20">
        {/* ETA Card */}
        <div className="p-8 rounded-3xl bg-(--clr-green)/5 border-2 border-(--clr-green)/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Siren size={64} className="animate-pulse" />
          </div>
          <p className="text-[10px] font-mono text-(--clr-green) uppercase tracking-[0.3em] mb-2">Estimated Arrival</p>
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-6xl font-bold tracking-tighter">{Math.ceil(eta)}</span>
            <span className="text-xl font-bold text-(--clr-green)">MIN</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-white/60">
            <span className="flex items-center gap-1.5"><Navigation size={12} /> {distance.toFixed(1)} KM</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> 12:44 PM</span>
          </div>
        </div>

        {/* Triage & Vehicle Section */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest ml-1">Incident Profile</h2>
          
          <AnimatePresence mode="wait">
            {isOffline && triageResult ? (
              <OfflineTriageBadge result={triageResult} />
            ) : (
              <div className="p-5 rounded-2xl bg-white/5 border border-(--clr-border) space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-(--clr-blue) uppercase font-bold tracking-widest flex items-center gap-2">
                    <Activity size={14} /> Critical Triage Output
                  </span>
                  <div className="px-2 py-1 rounded bg-(--clr-red)/20 text-(--clr-red) text-[8px] font-bold">CRITICAL</div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-mono text-white/40 uppercase mb-1">Heart Rate</p>
                    <p className="text-lg font-bold text-(--clr-red)">142 <span className="text-[10px]">bpm</span></p>
                  </div>
                  <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[8px] font-mono text-white/40 uppercase mb-1">SpO2</p>
                    <p className="text-lg font-bold text-(--clr-red)">86 <span className="text-[10px]">%</span></p>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          <VaahanLookup />
        </div>

        <div className="flex gap-4">
          <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2">
            <Users size={18} /> BYSTANDERS (2)
          </button>
          <button className="flex-1 py-4 bg-(--clr-blue) text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_var(--clr-glow-blue)]">
            <Phone size={18} /> CALL UNIT
          </button>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 bg-linear-to-t from-(--clr-bg) to-transparent z-20">
          <Link 
            to="/incident-report"
            className="w-full py-4 border border-white/10 rounded-xl font-mono text-[10px] tracking-widest text-(--clr-green) hover:bg-(--clr-green)/10 transition-all uppercase flex items-center justify-center gap-2 mb-4"
          >
            <FileText size={14} /> View Official iRAD / MoRTH Filing
          </Link>
          <button className="w-full py-4 border border-white/10 rounded-xl font-mono text-[10px] tracking-widest text-white/40 hover:text-white transition-all uppercase">
            Cancel Emergency Dispatch
          </button>
      </footer>

      <DroneDispatchPanel />
    </div>
  );
};
