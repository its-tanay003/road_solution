import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, Navigation2 } from 'lucide-react';

export const MapMiniPreview = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/map')}
      className="w-full max-w-[300px] h-[180px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative group text-left flex flex-col"
    >
      {/* Map Background Simulation */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0A0F1A]">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        {/* Animated Radar Pulse */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-blue-500/50"
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Mock Markers */}
        <div className="absolute top-[40%] left-[30%] w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        <div className="absolute top-[60%] left-[70%] w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
        
        {/* Center User Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] border-2 border-white" />
      </div>

      {/* Glass Overlay Top */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-10 bg-linear-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <Map size={14} className="text-blue-400" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live Tactical Map</span>
        </div>
      </div>

      {/* Info Overlay Bottom */}
      <div className="mt-auto relative z-10 p-3 bg-black/40 backdrop-blur-md border-t border-white/10 w-full flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] text-white/50 uppercase">Nearest Hosp</span>
            <span className="text-xs font-bold text-red-400 flex items-center gap-1">2.1 km</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-white/50 uppercase">Active Units</span>
            <span className="text-xs font-bold text-orange-400">12</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
          <Navigation2 size={14} className="text-white" />
        </div>
      </div>
    </motion.button>
  );
};
