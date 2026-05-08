import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MapPlace } from '../../store/mapDataStore';
import { Phone, Navigation, Info, Star } from 'lucide-react';

interface ServiceBottomSheetProps {
  places: MapPlace[];
  onPlaceClick: (place: MapPlace) => void;
}

export const ServiceBottomSheet = ({ places, onPlaceClick }: ServiceBottomSheetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group stats
  const hospitals = places.filter(p => p.type === 'hospitals').length;
  const ambulances = places.filter(p => p.type === 'ambulances').length;
  const police = places.filter(p => p.type === 'police').length;

  const getSheetY = () => {
    return isExpanded ? '40%' : 'calc(100% - 120px)';
  };

  return (
    <motion.div
      className="absolute left-0 right-0 bottom-0 bg-[#0A0F1A]/95 backdrop-blur-3xl border-t border-white/10 z-50 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-3xl"
      initial={{ top: 'calc(100% - 120px)' }}
      animate={{ top: getSheetY() }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={(_e, info) => {
        if (info.offset.y < -50) {
          setIsExpanded(true);
        } else if (info.offset.y > 50) {
          setIsExpanded(false);
        }
      }}
    >
      {/* Drag Handle & Info Strip */}
      <div 
        className="w-full flex flex-col items-center py-4 cursor-grab active:cursor-grabbing border-b border-white/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mb-3"></div>
        <div className="flex items-center gap-4 px-6 w-full justify-between">
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
            {places.length} Nearby Services
          </span>
          <span className="text-xs font-mono text-blue-400 uppercase">
            {hospitals} Hosp • {ambulances} Amb • {police} Pol
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.slice(0, isExpanded ? undefined : 0).map((place) => (
            <div 
              key={place.id} 
              className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => onPlaceClick(place)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="pr-4">
                  <h4 className="text-sm font-bold text-white tracking-tight leading-tight line-clamp-1">{place.name}</h4>
                  <p className="text-[10px] text-white/50 mt-1 line-clamp-1">{place.address || 'Address unavailable'}</p>
                </div>
                {place.rating && (
                  <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-500 text-[10px] font-bold">
                    <Star size={10} className="fill-yellow-500" />
                    {place.rating}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-3 mb-4">
                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase font-bold text-white/70">{place.type}</span>
                {place.isOpen !== undefined && (
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${place.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {place.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  onClick={(e) => { e.stopPropagation(); if (place.phone) window.open(`tel:${place.phone}`); }}
                >
                  <Phone size={14} /> Call
                </button>
                <button 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`); 
                  }}
                >
                  <Navigation size={14} /> Route
                </button>
                <button 
                  className="w-10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center rounded-xl transition-colors"
                  onClick={(e) => { e.stopPropagation(); onPlaceClick(place); }}
                >
                  <Info size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {places.length === 0 && isExpanded && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-50">
              <p className="text-sm font-bold text-white">No services found in this radius.</p>
              <p className="text-xs text-white/50 mt-1">Try expanding your search radius or changing layers.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
