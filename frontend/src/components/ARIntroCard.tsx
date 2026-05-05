import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Smartphone, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ARIntroCard: React.FC<{ incidentId: string }> = ({ incidentId }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-5 mt-6 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Navigation size={64} />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded">
          New: AR Navigation Beta
        </div>
        <Smartphone size={16} className="text-blue-400" />
      </div>

      <h3 className="text-lg font-black uppercase italic mb-2 tracking-tighter">Precision Guidance</h3>
      <p className="text-xs text-white/60 mb-6 leading-relaxed">
        Experience augmented reality overlays for split-second decisions and accurate arrival at the exact incident marker.
      </p>

      <button 
        onClick={() => navigate(`/responder/${incidentId}/ar`)}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        Enter AR Mode
        <ChevronRight size={18} />
      </button>

      <p className="mt-4 text-[8px] font-mono text-white/30 text-center uppercase tracking-widest">
        Device note: Chrome 79+ Android or Safari 15+ iOS
      </p>
    </motion.div>
  );
};
