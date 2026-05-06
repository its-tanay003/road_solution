import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, User, Clock, Activity, ShieldCheck, Navigation } from 'lucide-react';
import { useSosStore } from '../store';
import { useSocket } from '../hooks/useSocket';
import { LiveMap } from './LiveMap';
import { Badge } from './ui/Badge';

interface PositionUpdate {
  lat: number;
  lng: number;
  etaSeconds: number;
  status: string;
}

interface OnSceneUpdate {
  incidentLat: number;
  incidentLng: number;
}

export const DispatchCard: React.FC = () => {
  const { dispatch108, updateDispatchPosition, location } = useSosStore();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('unit:position', (data: PositionUpdate) => {
      updateDispatchPosition(data.lat, data.lng, data.etaSeconds, data.status);
    });

    socket.on('unit:on_scene', (data: OnSceneUpdate) => {
      updateDispatchPosition(data.incidentLat, data.incidentLng, 0, 'ON_SCENE');
    });

    return () => {
      socket.off('unit:position');
      socket.off('unit:on_scene');
    };
  }, [socket, updateDispatchPosition]);

  if (!dispatch108) return null;

  const unit = dispatch108.unit;
  const status = unit.status;
  const eta = dispatch108.eta;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.2)]"
    >
      {/* Status Header with Green Flash */}
      <div className={`relative px-6 py-3 flex items-center justify-between overflow-hidden ${status === 'ON_SCENE' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
        <div className="flex items-center gap-3 z-10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
          <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">
            108 EMRI DISPATCH: {status.replace('_', ' ')}
          </span>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 z-10 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/30">
          ID: {dispatch108.dispatchId}
        </div>
        
        {/* Animated Background Flash */}
        <motion.div 
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-emerald-400"
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Unit Info & ETA Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ambulance Unit</p>
                <p className="text-sm font-black text-white">{unit.unitId}</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="mesh" className="text-[8px] py-0">{unit.type}</Badge>
                  {unit.certifications.slice(0, 2).map(c => (
                    <Badge key={c} variant="info" className="text-[8px] py-0 border-white/20 text-white/60">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Paramedic / Driver</p>
                <p className="text-sm font-black text-white">{unit.paramedic}</p>
                <p className="text-[10px] text-slate-400">{unit.driver} (Pilot)</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Clock className="text-emerald-400 mb-2" size={24} />
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Estimated Arrival</p>
            <div className="text-3xl font-black text-white tracking-tighter my-1">
              {status === 'ON_SCENE' ? 'ARRIVED' : eta.display}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400/60">
              <Navigation size={10} />
              {dispatch108.distanceKm} KM REMAINING
            </div>
          </div>
        </div>

        {/* Map Miniature */}
        <div className="h-40 w-full rounded-2xl border border-white/10 overflow-hidden relative group">
          <LiveMap 
            services={[]} 
            userLat={location?.lat || 28.6139} 
            userLng={location?.lng || 77.2090}
            incidentLat={location?.lat}
            incidentLng={location?.lng}
            drones={dispatch108.currentLat ? [{ id: unit.unitId, lat: dispatch108.currentLat, lng: dispatch108.currentLng }] : []}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-mono text-white font-bold">TACTICAL_HUD_ACTIVE</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-2 gap-3">
           <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
             <Activity size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-black text-white tracking-widest uppercase">Telemetry Feed</span>
           </button>
           <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
             <ShieldCheck size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-black text-white tracking-widest uppercase">Safe Connect</span>
           </button>
        </div>
      </div>
      
      {/* CRT Scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_3px)]" />
    </motion.div>
  );
};
