import { motion, AnimatePresence } from 'framer-motion';
import { MapPlace } from '../../store/mapDataStore';
import { Phone, Navigation, Share2, X, Star, Clock, Copy, BedDouble, AlertCircle } from 'lucide-react';

interface ServiceDetailSheetProps {
  place: MapPlace | null;
  onClose: () => void;
}

export const ServiceDetailSheet = ({ place, onClose }: ServiceDetailSheetProps) => {
  if (!place) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute left-0 right-0 bottom-0 bg-[#0A0F1A]/95 backdrop-blur-3xl border-t border-white/10 z-[60] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.8)] rounded-t-3xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase font-bold text-white/70">
                  {place.type}
                </span>
                {place.isOpen !== undefined && (
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${place.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {place.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white leading-tight">{place.name}</h2>
              {place.rating && (
                <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold mt-1">
                  <Star size={12} className="fill-yellow-500" />
                  {place.rating} / 5.0
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <Navigation className="text-blue-400 mt-0.5 shrink-0" size={16} />
              <div className="flex-1">
                <p className="text-xs text-white/80">{place.address || 'Address unavailable'}</p>
              </div>
              <button className="text-white/50 hover:text-white" onClick={() => navigator.clipboard.writeText(place.address || '')}>
                <Copy size={14} />
              </button>
            </div>

            {/* Phone */}
            {place.phone && (
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <Phone className="text-green-400 shrink-0" size={16} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{place.phone}</p>
                </div>
                <button 
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold uppercase rounded-lg transition-colors"
                  onClick={() => window.open(`tel:${place.phone}`)}
                >
                  Call Now
                </button>
              </div>
            )}

            {/* Simulated Live Capacity for Hospitals */}
            {place.type === 'hospitals' && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={12} /> Live Capacity Simulation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-black text-white">12</div>
                    <div className="text-[10px] text-white/50 uppercase">ER Beds Available</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">4</div>
                    <div className="text-[10px] text-white/50 uppercase">ICU Beds</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button 
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`)}
              >
                <Navigation size={18} /> Get Directions
              </button>
              <button 
                className="w-14 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center rounded-xl transition-colors"
                onClick={() => {
                  const text = `${place.name} - ${place.address}. Location: https://maps.google.com/?q=${place.lat},${place.lng}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                }}
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
