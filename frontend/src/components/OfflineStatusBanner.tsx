import React, { useState, useEffect } from 'react';
import { WifiOff, CloudSync, MapPin, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCachedServicesCount, syncIncidentQueue } from '../lib/offlineDB';

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedCount, setCachedCount] = useState(0);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [syncedItems, setSyncedItems] = useState(0);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Attempt to sync queue when back online
      const count = await syncIncidentQueue(async (incident) => {
        // Mock sync function - in real app this calls the API
        console.log('Syncing incident:', incident);
        await new Promise(r => setTimeout(r, 1000));
      });
      if (count > 0) {
        setSyncedItems(count);
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 5000);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial count
    getCachedServicesCount().then(setCachedCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="bg-amber-500 text-black px-4 py-2 flex items-center justify-between pointer-events-auto border-b border-amber-600 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center animate-pulse">
                <WifiOff size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Offline Mode</span>
                <span className="text-[8px] font-bold opacity-80 uppercase tracking-tighter">Limited tactical coverage active</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full border border-black/10">
                <Database size={12} />
                <span className="text-[10px] font-bold">{cachedCount} services cached</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full border border-black/10">
                <MapPin size={12} />
                <span className="text-[10px] font-bold">20km tactical radius</span>
              </div>
            </div>
          </motion.div>
        )}

        {showSyncSuccess && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="bg-emerald-500 text-white px-4 py-2 flex items-center justify-center gap-3 pointer-events-auto shadow-lg"
          >
            <CloudSync size={18} className="animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">
              Connection Restored — Synced {syncedItems} offline reports
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
