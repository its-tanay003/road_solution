import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMapDataStore } from '../../store/mapDataStore';

const RADIUS_OPTIONS = [500, 1000, 2000, 3000, 5000, 10000];

export const RadiusControl = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { searchRadius, setSearchRadius } = useMapDataStore();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // The slider value will correspond to the index in RADIUS_OPTIONS
    const index = parseInt(e.target.value, 10);
    setSearchRadius(RADIUS_OPTIONS[index]);
  };

  const currentIndex = RADIUS_OPTIONS.indexOf(searchRadius) !== -1 
    ? RADIUS_OPTIONS.indexOf(searchRadius) 
    : 3; // default to 3000m

  return (
    <motion.div 
      className="absolute top-24 right-4 z-40 flex flex-col items-end shadow-2xl"
      initial={false}
      animate={{ width: isExpanded ? 200 : 48 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden flex flex-col w-full">
        {/* Header Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-12 flex items-center justify-between px-3 hover:bg-white/5 transition-colors border-b border-white/5 w-full"
        >
          {isExpanded ? <ChevronRight size={16} className="text-white/50" /> : <ChevronLeft size={16} className="text-white/50" />}
          <div className="flex items-center gap-3 ml-auto">
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-sm text-white whitespace-nowrap"
                >
                  {searchRadius >= 1000 ? `${searchRadius / 1000} km` : `${searchRadius} m`}
                </motion.span>
              )}
            </AnimatePresence>
            <Radar className="text-white min-w-[20px]" size={20} />
          </div>
        </button>

        {/* Slider */}
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[100px] p-4' : 'max-h-0'}`}>
          <div className="flex justify-between text-[10px] text-white/50 font-mono mb-2">
            <span>500m</span>
            <span>10km</span>
          </div>
          <input 
            type="range" 
            min={0} 
            max={RADIUS_OPTIONS.length - 1} 
            step={1} 
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full accent-blue-500 bg-white/20 h-1.5 rounded-full appearance-none outline-none"
          />
        </div>
      </div>
    </motion.div>
  );
};
