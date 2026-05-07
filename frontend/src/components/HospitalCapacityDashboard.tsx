import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHospitalStore } from '../store';
import type { Hospital } from '../store';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ShieldPlus, Clock, Activity, CheckCircle2, XCircle, Zap, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface HospitalCapacityDashboardProps {
  onClose: () => void;
  incidentLocation?: { lat: number; lng: number };
  incidentConditions?: string[];
}

export const HospitalCapacityDashboard: React.FC<HospitalCapacityDashboardProps> = ({ 
  incidentLocation = { lat: 28.6139, lng: 77.2090 }, // Default near New Delhi
  incidentConditions = ['head trauma'] // Default for demo
}) => {
  const { connected } = useSocket();
  const { startSimulation, stopSimulation, computeBestMatches, preAlertHospital } = useHospitalStore();
  const [matches, setMatches] = useState<Hospital[]>(() => 
    computeBestMatches(incidentLocation.lat, incidentLocation.lng, incidentConditions)
  );

  useEffect(() => {
    startSimulation();
    return () => stopSimulation();
  }, [startSimulation, stopSimulation]);

  useEffect(() => {
    // Recompute matches on interval to catch simulated bed changes
    const interval = setInterval(() => {
      setMatches(computeBestMatches(incidentLocation.lat, incidentLocation.lng, incidentConditions));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [computeBestMatches, incidentLocation, incidentConditions]);

  const handlePreAlert = async (id: string) => {
    await preAlertHospital(id, { conditions: incidentConditions });
  };

  return (
    <div className="w-full h-full flex flex-col bg-(--nx-bg-(--color-surface)) overflow-hidden relative">
      {!connected && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-1000 bg-amber-500/90 backdrop-blur-md text-black px-4 py-1.5 rounded-full flex items-center gap-2 border border-amber-600 shadow-xl pointer-events-none">
          <AlertTriangle size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Real-time updates paused — showing last known data</span>
        </div>
      )}
      {/* Header */}
      <div className="h-16 border-b border-(--nx-border) px-6 flex items-center justify-between bg-(--nx-bg-base)">
        <div className="flex items-center gap-3">
          <ShieldPlus size={20} className="text-(--nx-blue-primary)" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Live Hospital Capacity Matrix</h2>
          <Badge variant="active" className="ml-2 animate-pulse">LIVE TELEMETRY</Badge>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col text-right">
              <span className="text-[10px] text-(--nx-text-tertiary) uppercase tracking-widest">Active Filters</span>
              <span className="text-xs text-(--nx-blue-primary) font-mono uppercase">{incidentConditions.join(' | ')}</span>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <AnimatePresence>
            {matches.map((hospital, index) => {
              const isTopMatch = index === 0;
              const capacityRatio = Math.max(0, Math.min(100, ((hospital.erTotalBeds - hospital.erAvailableBeds) / hospital.erTotalBeds) * 100));
              const strokeColor = capacityRatio > 85 ? 'var(--nx-red-primary)' : capacityRatio > 50 ? 'var(--nx-amber-primary)' : 'var(--nx-green-primary)';

              return (
                <motion.div
                  key={hospital.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`nexus-card p-6 flex flex-col relative overflow-hidden ${
                    isTopMatch ? 'border-(--nx-green-primary) shadow-[0_0_20px_rgba(48,209,88,0.15)] bg-(--nx-green-dim)' : 'border-(--nx-border) bg-(--nx-bg-base)'
                  }`}
                >
                  {isTopMatch && (
                    <div className="absolute top-0 right-0 bg-(--nx-green-primary) text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest flex items-center gap-1 rounded-bl-sm z-10">
                      <Zap size={10} /> AI RECOMMENDED
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-6 z-10">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">{hospital.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] font-mono text-(--nx-text-secondary)">ID: {hospital.id}</span>
                        <Badge variant={hospital.traumaLevel === 1 ? 'critical' : 'warning'}>Level {hospital.traumaLevel} Trauma</Badge>
                      </div>
                    </div>
                    
                    {/* Capacity Ring */}
                    <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <path
                          className="stroke-(--nx-bg-overlay) fill-none"
                          strokeWidth="3"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <motion.path
                          className="fill-none"
                          stroke={strokeColor}
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "0, 100" }}
                          animate={{ strokeDasharray: `${capacityRatio}, 100` }}
                          transition={{ duration: 0.5 }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-1">
                        <span className="text-[9px] text-(--nx-text-tertiary) leading-none uppercase">Load</span>
                        <span className="text-xs font-bold text-white leading-none mt-1">{Math.round(capacityRatio)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 z-10">
                    <div className="bg-black/30 p-3 rounded-sm border border-(--nx-border)">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity size={12} className="text-(--nx-text-tertiary)" />
                        <span className="text-[10px] text-(--nx-text-secondary) uppercase tracking-widest">ER Beds Available</span>
                      </div>
                      <motion.div 
                        key={hospital.erAvailableBeds}
                        initial={{ color: 'var(--nx-text-primary)' }}
                        animate={{ color: ['var(--nx-red-primary)', 'var(--nx-text-primary)'] }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl font-mono font-bold text-white"
                      >
                        {hospital.erAvailableBeds} <span className="text-xs font-sans text-(--nx-text-tertiary) font-normal">/ {hospital.erTotalBeds}</span>
                      </motion.div>
                    </div>
                    
                    <div className="bg-black/30 p-3 rounded-sm border border-(--nx-border)">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={12} className="text-(--nx-text-tertiary)" />
                        <span className="text-[10px] text-(--nx-text-secondary) uppercase tracking-widest">Est. Wait & ETA</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="text-2xl font-mono font-bold text-white">{hospital.erWaitMinutes}m</div>
                        <div className="text-xs font-mono text-(--nx-blue-primary) mb-1 bg-(--nx-blue-dim) px-2 py-0.5 rounded-sm">+{hospital.estimatedETA}m ETA</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6 text-[11px] font-medium uppercase tracking-wider z-10">
                    <div className="flex items-center gap-1.5">
                      {hospital.traumaSurgeonOnCall ? <CheckCircle2 size={14} className="text-(--nx-green-primary)" /> : <XCircle size={14} className="text-(--nx-red-primary)" />}
                      <span className={hospital.traumaSurgeonOnCall ? 'text-(--nx-text-primary)' : 'text-(--nx-text-tertiary)'}>Trauma Surg.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hospital.neurologyAvailable ? <CheckCircle2 size={14} className="text-(--nx-green-primary)" /> : <XCircle size={14} className="text-(--nx-red-primary)" />}
                      <span className={hospital.neurologyAvailable ? 'text-(--nx-text-primary)' : 'text-(--nx-text-tertiary)'}>Neurology</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto text-(--nx-text-secondary)">
                      <span className="font-mono bg-(--nx-bg-overlay) px-1.5 rounded-sm">{hospital.bloodBankReady.length}</span> Blood Types
                    </div>
                  </div>

                  <div className="mt-auto z-10">
                    {hospital.preAlerted ? (
                      <div className="w-full h-10 bg-(--nx-blue-dim) border border-(--nx-blue-primary) rounded-sm flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={14} className="text-(--nx-blue-primary) animate-pulse" />
                          <span className="text-[11px] font-bold text-(--nx-blue-primary) uppercase tracking-widest">PRE-ALERTED</span>
                        </div>
                        <span className="text-xs font-mono text-white tracking-widest">ETA -{hospital.estimatedETA}:00</span>
                      </div>
                    ) : (
                      <Button 
                        variant={hospital.acceptingTrauma ? 'primary' : 'secondary'}
                        className={`w-full h-10 text-[11px] ${isTopMatch ? 'bg-(--nx-green-primary) text-black hover:bg-(--nx-green-primary)/80' : ''}`}
                        disabled={!hospital.acceptingTrauma}
                        onClick={() => handlePreAlert(hospital.id)}
                      >
                        {hospital.acceptingTrauma ? 'DISPATCH & PRE-ALERT' : 'DIVERTING AMBULANCES'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
