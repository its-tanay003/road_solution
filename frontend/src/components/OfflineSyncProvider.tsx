import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserStore } from '../store';
import { saveServicesForArea, saveEmergencyNumbers } from '../lib/offlineDB';
import emergencyData from '../data/emergency-numbers.json';
import { Database, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haversine } from '../utils/geo';

interface OfflineSyncContextType {
  isCaching: boolean;
  progress: number;
  total: number;
  isReady: boolean;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCaching, setIsCaching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [lastCacheLoc, setLastCacheLoc] = useState<{ lat: number, lng: number } | null>(null);
  const { countryCode } = useUserStore();

  const cacheServices = async (lat: number, lng: number) => {
    try {
      setIsCaching(true);
      setProgress(0);
      
      // 1. Cache Emergency Numbers for the detected area (mock detect IN for demo)
      await saveEmergencyNumbers(countryCode, (emergencyData as any)[countryCode] || emergencyData.IN);
      
      // 2. Fetch Nearby Services (Mock fetch for demo pre-cache)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/nearby-services?lat=${lat}&lng=${lng}&radius=20000`);
      const data = await response.json();
      
      const services = data.results || [];
      setTotal(services.length);
      
      // Chunked save to IndexedDB to show progress
      for (let i = 0; i < services.length; i += 10) {
        const chunk = services.slice(i, i + 10);
        await saveServicesForArea(lat, lng, chunk);
        setProgress(Math.min(i + 10, services.length));
        await new Promise(r => setTimeout(r, 100)); // Visual progress
      }

      setLastCacheLoc({ lat, lng });
      setIsReady(true);
      setTimeout(() => setIsCaching(false), 2000);
    } catch (err) {
      console.error('Pre-cache failed:', err);
      setIsCaching(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      
      if (!lastCacheLoc) {
        cacheServices(lat, lng);
      } else {
        // Recache if moved > 5km
        const dist = haversine(lat, lng, lastCacheLoc.lat, lastCacheLoc.lng);
        if (dist > 5) {
          cacheServices(lat, lng);
        }
      }
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [lastCacheLoc]);

  return (
    <OfflineSyncContext.Provider value={{ isCaching, progress, total, isReady }}>
      {children}
      
      <AnimatePresence>
        {isCaching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 bg-(--nx-bg-surface) border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[240px]"
          >
            <div className="relative">
              <Loader2 className="text-nx-blue-primary animate-spin" size={24} />
              <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black">
                {Math.round((progress/total) * 100)}%
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest">Caching Offline Data</span>
                <Database size={12} className="text-nx-text-dim" />
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-nx-blue-primary"
                  animate={{ width: `${(progress/total) * 100}%` }}
                />
              </div>
              <p className="text-[8px] text-nx-text-dim uppercase tracking-tighter">
                {progress}/{total} services saved for area
              </p>
            </div>
          </motion.div>
        )}

        {isReady && !isCaching && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-24 right-6 z-50 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 px-4 shadow-xl flex items-center gap-3"
          >
            <ShieldCheck className="text-emerald-500" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Offline Ready</span>
          </motion.div>
        )}
      </AnimatePresence>
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) throw new Error('useOfflineSync must be used within OfflineSyncProvider');
  return context;
};
