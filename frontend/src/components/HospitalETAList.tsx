import React, { useState, useEffect } from 'react';
import { Hospital, Clock, CheckCircle2, AlertCircle, Bed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HospitalETA {
  name: string;
  etaMinutes: number;
  type: string;
  beds: { available: number; total: number };
  onDivert?: boolean;
}

const INITIAL_HOSPITALS: HospitalETA[] = [
  { name: 'MIOT International', etaMinutes: 8, type: 'Trauma Center', beds: { available: 3, total: 25 } },
  { name: 'Apollo Hospitals', etaMinutes: 12, type: 'Multi-Specialty', beds: { available: 8, total: 20 } },
  { name: 'Fortis Malar', etaMinutes: 15, type: 'Emergency Care', beds: { available: 0, total: 12 }, onDivert: true },
  { name: 'Vijaya Hospital', etaMinutes: 22, type: 'General', beds: { available: 5, total: 30 } },
  { name: 'Kauvery Hospital', etaMinutes: 28, type: 'Heart & Trauma', beds: { available: 6, total: 15 } }
];

interface Props {
  remainingMinutes: number;
}

export const HospitalETAList: React.FC<Props> = ({ remainingMinutes }) => {
  const [hospitals, setHospitals] = useState<HospitalETA[]>(INITIAL_HOSPITALS);

  // Simulation: slowly fluctuate available beds
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(current => current.map(h => {
        const delta = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newAvailable = Math.max(0, Math.min(h.beds.total, h.beds.available + delta));
        return {
          ...h,
          beds: { ...h.beds, available: newAvailable },
          onDivert: newAvailable === 0
        };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCapacityColor = (h: HospitalETA) => {
    if (h.onDivert) return 'text-(--clr-red)';
    const pct = (h.beds.available / h.beds.total) * 100;
    if (pct > 30) return 'text-(--clr-green)';
    if (pct > 10) return 'text-(--clr-amber)';
    return 'text-(--clr-red)';
  };

  return (
    <div className="space-y-3 w-full max-w-md">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Nearby Trauma Centers
        </h3>
        <span className="text-[8px] font-mono text-green-500 animate-pulse">● CAPACITY LIVE</span>
      </div>
      
      <div className="space-y-2">
        {hospitals.map((hospital, index) => {
          const isAvailable = hospital.etaMinutes < remainingMinutes && !hospital.onDivert;
          
          return (
            <motion.div
              key={hospital.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center justify-between p-3 rounded-xl border transition-all duration-500
                ${isAvailable 
                  ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]' 
                  : 'bg-red-500/5 border-red-500/20 grayscale opacity-60'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isAvailable ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  <Hospital className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {hospital.name}
                    {hospital.onDivert && (
                      <span className="text-[7px] bg-red-600 text-white px-1 rounded font-black">DIVERT</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <Bed size={10} />
                      <span className={getCapacityColor(hospital)}>{hospital.beds.available} Avail</span>
                    </div>
                    <span className="text-[10px] text-gray-600">|</span>
                    <div className="text-[10px] text-gray-400 font-medium">{hospital.type}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-mono font-bold text-white">
                    {hospital.etaMinutes}m
                  </span>
                </div>
                
                <AnimatePresence mode="wait">
                  {isAvailable ? (
                    <motion.div
                      key="in-range"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      READY
                    </motion.div>
                  ) : (
                    <motion.div
                      key="closed"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {hospital.onDivert ? 'CAPACITY FULL' : 'WINDOW CLOSED'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
