import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSosStore, useAmbulanceStore } from '../store';
import { ARHud } from './ARHud';
import { VaahanLookup } from './VaahanLookup';

export const ARNavigationView: React.FC = () => {
  const navigate = useNavigate();
  const { location: incidentLoc } = useSosStore();
  const { ambulances, dispatchedUnitId, distance: distText } = useAmbulanceStore();
  
  const [speed, setSpeed] = useState(42);
  const [showVaahan, setShowVaahan] = useState(false);

  const unit = ambulances.find(a => a.unitId === dispatchedUnitId);
  const currentPos: [number, number] = unit ? [unit.currentLat, unit.currentLng] : [28.6139, 77.2090];
  const targetPos: [number, number] = incidentLoc ? [incidentLoc.lat, incidentLoc.lng] : [28.6145, 77.2095];

  // Mock ETA seconds for the HUD animation if not available
  const etaSeconds = unit ? (unit.route.length - unit.routeIndex) * 2 : 120;
  const goldenHourRemaining = 44 * 60 + 12; // 44:12

  useEffect(() => {
    const sTimer = setInterval(() => {
      setSpeed(prev => Math.max(38, Math.min(48, prev + (Math.random() - 0.5) * 4)));
    }, 2000);

    return () => {
      clearInterval(sTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#080C14] text-white overflow-hidden font-ui">
      {/* 3D AR HUD Component */}
      <div className="absolute inset-0 z-0">
        <ARHud 
          incidentLat={targetPos[0]}
          incidentLng={targetPos[1]}
          userLat={currentPos[0]}
          userLng={currentPos[1]}
          etaSeconds={etaSeconds}
          goldenHourRemaining={goldenHourRemaining}
        />
      </div>

      {/* UI Overlays */}
      <div className="relative h-full flex flex-col p-8 z-10 pointer-events-none">
        {/* Top HUD */}
        <div className="flex justify-between items-start">
          <div className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl pointer-events-auto">
            <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Current Speed</p>
            <p className="text-3xl font-mono font-black italic">
              {Math.floor(speed)} <span className="text-sm">KM/H</span>
            </p>
          </div>

          <div className="text-right p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl pointer-events-auto">
            <p className="text-[10px] font-mono text-amber-500 uppercase font-bold mb-1">Golden Hour Timer</p>
            <p className="text-3xl font-mono font-black text-amber-500 italic">44:12</p>
          </div>
        </div>

        {/* Central AR Overlay Labels (Floating over 3D) */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <AnimatePresence>
            {showVaahan && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-0 top-0 w-80 pointer-events-auto"
              >
                <VaahanLookup />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-1/4 right-0 transform translate-x-4">
            <div className="p-4 bg-blue-600/20 backdrop-blur-md border border-blue-500/40 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-400" />
                <div>
                  <p className="text-[8px] font-black uppercase opacity-60">Hospital ETA 4m</p>
                  <p className="text-sm font-black uppercase italic">Apollo Hospital — Turn Right 200m</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-1/4 left-0 transform -translate-x-4">
            <motion.div 
              animate={{ borderColor: ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.4)'] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="p-4 bg-red-600/20 backdrop-blur-md border border-red-500/40 rounded-2xl shadow-[0_0_20px_rgba(239, 68, 68, 0.2)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <div>
                  <p className="text-[8px] font-black uppercase text-red-400">Incident Detected</p>
                  <p className="text-sm font-black uppercase italic">Incident Zone — Distance {distText || 'Calculating...'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-white/40 uppercase tracking-widest">
              <Activity size={14} /> AR HUD v2.0 — CONTEXT HARDENED
            </div>
            
            <button 
              onClick={() => setShowVaahan(!showVaahan)}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all pointer-events-auto flex items-center gap-2 ${
                showVaahan ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <Search size={14} /> VAAHAN Lookup
            </button>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-95 pointer-events-auto"
          >
            End AR Navigation
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-20 text-[8px] font-mono text-center uppercase pointer-events-none">
        Full WebGL AR context management enabled. Automatic resource disposal active.
      </div>
    </div>
  );
};
