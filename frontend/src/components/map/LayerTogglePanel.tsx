import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Cross, Pill, Droplet, Car, Shield, 
  Flame, Fuel, ParkingCircle, CreditCard, AlertTriangle, AlertCircle,
  Layers, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useMapDataStore } from '../../store/mapDataStore';
import type { ServiceLayerType } from '../../store/mapDataStore';

const LAYERS: { id: ServiceLayerType; label: string; icon: any; color: string }[] = [
  { id: 'hospitals', label: 'Hospitals', icon: Building2, color: 'text-red-500' },
  { id: 'clinics', label: 'Clinics', icon: Cross, color: 'text-pink-500' },
  { id: 'pharmacies', label: 'Pharmacies', icon: Pill, color: 'text-green-500' },
  { id: 'bloodBanks', label: 'Blood Banks', icon: Droplet, color: 'text-red-600' },
  { id: 'ambulances', label: 'Ambulances', icon: Car, color: 'text-orange-500' },
  { id: 'police', label: 'Police', icon: Shield, color: 'text-blue-500' },
  { id: 'fire', label: 'Fire Stations', icon: Flame, color: 'text-red-500' },
  { id: 'fuel', label: 'Fuel/Petrol', icon: Fuel, color: 'text-yellow-500' },
  { id: 'tolls', label: 'Toll Plazas', icon: ParkingCircle, color: 'text-purple-500' },
  { id: 'atms', label: 'ATMs', icon: CreditCard, color: 'text-gray-400' },
  { id: 'blackSpots', label: 'NH Danger Zones', icon: AlertTriangle, color: 'text-red-500' },
  { id: 'hazards', label: 'Hazards', icon: AlertCircle, color: 'text-orange-500' },
];

export const LayerTogglePanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { activeLayers, toggleLayer, sosActive } = useMapDataStore();

  return (
    <motion.div 
      className="absolute top-24 left-4 z-40 flex shadow-2xl"
      initial={false}
      animate={{ width: isExpanded ? 240 : 48 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden flex flex-col w-full">
        {/* Header Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-12 flex items-center justify-between px-3 hover:bg-white/5 transition-colors border-b border-white/5"
        >
          <div className="flex items-center gap-3">
            <Layers className="text-white min-w-[20px]" size={20} />
            <AnimatePresence>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-sm text-white whitespace-nowrap"
                >
                  Map Layers
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {isExpanded ? <ChevronLeft size={16} className="text-white/50" /> : <ChevronRight size={16} className="text-white/50" />}
        </button>

        {/* Layer List */}
        <div className={`overflow-y-auto transition-all duration-300 ${isExpanded ? 'max-h-[60vh] py-2' : 'max-h-0'}`}>
          {LAYERS.map((layer) => {
            const isActive = activeLayers.has(layer.id);
            // In SOS mode, non-critical layers might be force-disabled by the store logic, 
            // but we can also visually disable them here if we want.
            const isDisabled = sosActive && !['hospitals', 'ambulances'].includes(layer.id);

            return (
              <button
                key={layer.id}
                onClick={() => !isDisabled && toggleLayer(layer.id)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? layer.color.replace('text-', 'bg-').replace('500', '500/20') : 'bg-white/5'}`}>
                    <layer.icon size={16} className={isActive ? layer.color : 'text-white/50'} />
                  </div>
                  <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-white/60'}`}>
                    {layer.label}
                  </span>
                </div>
                
                {/* Custom Toggle Switch */}
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isActive ? 'bg-blue-500' : 'bg-white/20'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isActive ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
