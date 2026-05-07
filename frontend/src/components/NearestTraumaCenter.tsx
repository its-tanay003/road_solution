import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { Hospital, Navigation, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../lib/socket';
import { logger } from '../lib/logger';

interface TraumaCenter {
  id: string;
  name: string;
  address: string;
  distance: number;
  bedsAvailable: number;
  icuBedsAvailable: number;
  lat: number;
  lng: number;
}

export const NearestTraumaCenter: React.FC = () => {
  const [center, setCenter] = useState<TraumaCenter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        setLoading(true);
        let lat = 13.0617; // Default Chennai
        let lng = 80.2520;
        
        if ("geolocation" in navigator) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch {
            logger.warn("Using default location for trauma center");
          }
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/hospitals/nearby`, {
          params: { lat, lng }
        });

        if (res.data.services && res.data.services.length > 0) {
          // Find closest with ICU beds
          const validHospitals = res.data.services.filter((h: TraumaCenter) => h.icuBedsAvailable > 0);
          if (validHospitals.length > 0) {
            setCenter(validHospitals[0]);
          } else {
            setCenter(res.data.services[0]);
          }
        }
      } catch (err) {
        logger.error("Failed to fetch nearest trauma center", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCenter();

    const socket = getSocket();
    const handleHospitalUpdates = (updates: TraumaCenter[]) => {
      setCenter(prev => {
        if (!prev) return prev;
        const update = updates.find(u => u.id === prev.id);
        if (update) {
          return { ...prev, bedsAvailable: update.bedsAvailable, icuBedsAvailable: update.icuBedsAvailable };
        }
        return prev;
      });
    };

    socket.on('hospital_updates', handleHospitalUpdates);
    return () => {
      socket.off('hospital_updates', handleHospitalUpdates);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-24 bg-red-900/20 border border-red-500/20 rounded-3xl animate-pulse mt-4"></div>
    );
  }

  if (!center) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 w-full max-w-sm mx-auto bg-slate-900/80 backdrop-blur-md border border-red-500/30 p-4 rounded-3xl shadow-xl shadow-red-900/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="bg-red-500/20 p-3 rounded-2xl">
          <Hospital size={24} className="text-red-500" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full">
              Nearest Trauma Center
            </span>
          </div>
          <h3 className="text-white font-bold leading-tight">{center.name}</h3>
          <p className="text-slate-400 text-xs mt-1 truncate">{center.address}</p>
          
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-400">{center.icuBedsAvailable} ICU Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-blue-400" />
              <span className="text-xs font-medium text-blue-400">ETA 8 min</span>
            </div>
          </div>
        </div>
      </div>
      
      <a 
        href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-xs font-black text-white uppercase tracking-widest transition-colors"
      >
        <Navigation size={14} />
        Navigate
      </a>
    </motion.div>
  );
};
