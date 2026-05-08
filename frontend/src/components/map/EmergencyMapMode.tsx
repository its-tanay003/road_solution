import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapDataStore } from '../../store/mapDataStore';
import { AlertTriangle, X } from 'lucide-react';

export const EmergencyMapMode = () => {
  const { sosActive, setSosActive } = useMapDataStore();

  useEffect(() => {
    if (sosActive) {
      // Logic to trigger route drawing would typically happen here
      // by setting a destination (nearest hospital) and invoking DirectionsService
    }
  }, [sosActive]);

  return (
    <AnimatePresence>
      {sosActive && (
        <>
          {/* Pulsing Red Overlay */}
          <motion.div 
            className="absolute inset-0 pointer-events-none z-[100] border-[8px] border-red-500/50"
            animate={{ borderColor: ['rgba(239,68,68,0.2)', 'rgba(239,68,68,0.8)', 'rgba(239,68,68,0.2)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Top Emergency Banner */}
          <motion.div 
            className="absolute top-0 left-0 right-0 z-[101] bg-red-600 text-white p-3 flex flex-col sm:flex-row items-center justify-between shadow-2xl"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="animate-pulse" />
              <div>
                <h2 className="font-black text-lg tracking-widest uppercase">Emergency Mode Active</h2>
                <p className="text-xs text-red-200 font-medium">Nearest Hospital: Apollo (2.1km, 6 min) • Route Generated</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSosActive(false)}
              className="mt-3 sm:mt-0 px-4 py-2 bg-black/30 hover:bg-black/50 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-2"
            >
              <X size={14} /> Cancel Mode
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
