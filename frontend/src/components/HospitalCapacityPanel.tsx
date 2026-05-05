import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hospital, Bed, Droplets, Clock, AlertTriangle, CheckCircle, Activity, ChevronRight } from 'lucide-react';

interface HospitalData {
  id: string;
  name: string;
  type: 'Level I Trauma' | 'Level II' | 'Basic ER';
  traumaBeds: { available: number; total: number };
  icuBeds: number;
  bloodBank: { [key: string]: 'Low' | 'Stable' | 'High' };
  waitTime: number;
  onDivert: boolean;
}

const INITIAL_HOSPITALS: HospitalData[] = [
  {
    id: 'h1',
    name: "Apollo Main Greams Road",
    type: 'Level I Trauma',
    traumaBeds: { available: 8, total: 20 },
    icuBeds: 5,
    bloodBank: { 'A+': 'Stable', 'B+': 'High', 'O+': 'Low' },
    waitTime: 25,
    onDivert: false
  },
  {
    id: 'h2',
    name: "MIOT International",
    type: 'Level I Trauma',
    traumaBeds: { available: 3, total: 25 },
    icuBeds: 2,
    bloodBank: { 'A+': 'Low', 'B+': 'Stable', 'O+': 'Stable' },
    waitTime: 45,
    onDivert: false
  },
  {
    id: 'h3',
    name: "Fortis Malar",
    type: 'Level II',
    traumaBeds: { available: 0, total: 12 },
    icuBeds: 1,
    bloodBank: { 'A+': 'Stable', 'B+': 'Low', 'O+': 'High' },
    waitTime: 60,
    onDivert: true
  },
  {
    id: 'h4',
    name: "Kauvery Hospital",
    type: 'Level II',
    traumaBeds: { available: 6, total: 15 },
    icuBeds: 4,
    bloodBank: { 'A+': 'High', 'B+': 'High', 'O+': 'Stable' },
    waitTime: 15,
    onDivert: false
  },
  {
    id: 'h5',
    name: "MMC Government General",
    type: 'Level I Trauma',
    traumaBeds: { available: 12, total: 50 },
    icuBeds: 8,
    bloodBank: { 'A+': 'Stable', 'B+': 'Stable', 'O+': 'High' },
    waitTime: 90,
    onDivert: false
  }
];

export const HospitalCapacityPanel: React.FC = () => {
  const [hospitals, setHospitals] = useState<HospitalData[]>(INITIAL_HOSPITALS);

  // Simulation: Seeded random walk every 15s (faster for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(current => current.map(h => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const newAvailable = Math.max(0, Math.min(h.traumaBeds.total, h.traumaBeds.available + delta));
        
        // Auto divert logic
        const onDivert = newAvailable === 0;
        
        // Wait time fluctuation
        const timeDelta = Math.floor(Math.random() * 5) - 2;
        const newWaitTime = Math.max(5, h.waitTime + timeDelta);

        return {
          ...h,
          traumaBeds: { ...h.traumaBeds, available: newAvailable },
          waitTime: newWaitTime,
          onDivert
        };
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (current: number, total: number) => {
    const pct = (current / total) * 100;
    if (pct > 30) return 'text-(--clr-green)';
    if (pct > 10) return 'text-(--clr-amber)';
    return 'text-(--clr-red)';
  };

  const getBloodColor = (status: string) => {
    if (status === 'High') return 'text-(--clr-green)';
    if (status === 'Stable') return 'text-(--clr-blue)';
    return 'text-(--clr-red)';
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
            <Activity size={16} className="text-(--clr-blue)" /> 
            Real-Time Capacity
          </h2>
          <p className="text-[10px] font-mono text-white/40 uppercase">Chennai Medical Grid · Live Sync</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-(--clr-green) animate-pulse" />
          <span className="text-[8px] font-mono uppercase text-(--clr-green)">Live Data</span>
        </div>
      </div>

      <AnimatePresence mode='popLayout'>
        {hospitals.map((hospital) => (
          <motion.div
            key={hospital.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-2xl border transition-all ${hospital.onDivert ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  {hospital.name}
                  {hospital.onDivert && (
                    <span className="px-2 py-0.5 rounded-full bg-(--clr-red) text-[8px] font-black uppercase tracking-widest text-white">
                      ON DIVERT
                    </span>
                  )}
                </h3>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">{hospital.type}</p>
              </div>
              <Hospital size={16} className={hospital.onDivert ? 'text-(--clr-red)' : 'text-white/20'} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <Bed size={12} /> Trauma Beds
                  </div>
                  <span className={`text-xs font-black ${getStatusColor(hospital.traumaBeds.available, hospital.traumaBeds.total)}`}>
                    {hospital.traumaBeds.available}/{hospital.traumaBeds.total}
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(hospital.traumaBeds.available / hospital.traumaBeds.total) * 100}%` }}
                    className={`h-full ${hospital.onDivert ? 'bg-(--clr-red)' : 'bg-(--clr-blue)'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-white/60">
                    <Clock size={12} /> ER Wait
                  </div>
                  <span className="text-xs font-black text-white/90">{hospital.waitTime}m</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-(--clr-amber)" 
                    style={{ width: `${Math.min(100, (hospital.waitTime / 120) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Droplets size={10} className="text-(--clr-red)" />
                  <div className="flex gap-1">
                    {Object.entries(hospital.bloodBank).map(([type, status]) => (
                      <span key={type} className={`text-[8px] font-bold ${getBloodColor(status)}`}>{type}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-white/40">
                  <Activity size={10} />
                  <span className="text-[8px] font-bold uppercase">{hospital.icuBeds} ICU AVAIL</span>
                </div>
              </div>
              <button className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
