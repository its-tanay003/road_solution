import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hospital, Bed, Droplets, Clock, Activity, ChevronRight } from 'lucide-react';

interface HospitalData {
  id: string;
  name: string;
  type: string;
  traumaBeds: { available: number; total: number };
  bloodUnits: { available: number; total: number };
  onDivert: boolean;
  distance: number;
}

const mockHospitals: HospitalData[] = [
  { id: '1', name: 'Fortis Memorial', type: 'Trauma Level I', traumaBeds: { available: 4, total: 12 }, bloodUnits: { available: 45, total: 100 }, onDivert: false, distance: 3.2 },
  { id: '2', name: 'Medanta Medicity', type: 'Specialized Trauma', traumaBeds: { available: 1, total: 15 }, bloodUnits: { available: 12, total: 120 }, onDivert: true, distance: 5.8 },
  { id: '3', name: 'Max Hospital', type: 'Trauma Level II', traumaBeds: { available: 8, total: 10 }, bloodUnits: { available: 88, total: 100 }, onDivert: false, distance: 4.1 }
];

export const HospitalCapacityPanel = () => {
  const [hospitals, setHospitals] = useState<HospitalData[]>(mockHospitals);

  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(prev => prev.map(h => ({
        ...h,
        traumaBeds: { 
          ...h.traumaBeds, 
          available: Math.max(0, Math.min(h.traumaBeds.total, h.traumaBeds.available + (Math.random() > 0.5 ? 1 : -1))) 
        }
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (current: number, total: number) => {
    const pct = (current / total) * 100;
    if (pct > 50) return 'text-emerald-500';
    if (pct > 20) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-[#080C14]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black italic tracking-widest text-white uppercase flex items-center gap-2">
            <Activity size={16} className="text-[#FF9933]" />
            Regional Capacity HUD
          </h2>
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-tighter mt-1">Real-time trauma intake monitoring</p>
        </div>
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <span className="text-[10px] font-black text-white/40 uppercase">ACTIVE_SCAN</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence>
          {hospitals.map((hospital) => (
            <motion.div
              key={hospital.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-2xl border transition-all ${
                hospital.onDivert ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-tight ${hospital.onDivert ? 'text-red-500' : 'text-white'}`}>
                    {hospital.name}
                  </h3>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">{hospital.type}</p>
                </div>
                <Hospital size={16} className={hospital.onDivert ? 'text-red-500' : 'text-white/20'} />
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
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${hospital.traumaBeds.available / hospital.traumaBeds.total > 0.5 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      animate={{ width: `${(hospital.traumaBeds.available / hospital.traumaBeds.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <Droplets size={12} /> O- Blood
                    </div>
                    <span className="text-xs font-black text-white/80">
                      {hospital.bloodUnits.available}U
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FF9933]/40"
                      style={{ width: `${(hospital.bloodUnits.available / hospital.bloodUnits.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {hospital.onDivert && (
                <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <Clock size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Ambulance Diversion Active</span>
                  </div>
                  <ChevronRight size={14} className="text-red-500" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white/2 border-t border-white/5">
        <button className="w-full py-3 bg-[#FF9933] text-[#080C14] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
          Broadcast Availability Request
        </button>
      </div>
    </div>
  );
};
