import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Hospital, 
  Shield, 
  Flame, 
  Pill, 
  MapPin, 
  Phone, 
  Navigation,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/db';
import { getSocket } from '../lib/socket';
import { logger } from '../lib/logger';

interface Service {
  id: string;
  name: string;
  type: string;
  icon: string;
  lat: number;
  lng: number;
  address: string;
  rating?: number;
  isOpen?: boolean;
  phone?: string | null;
  distance?: number;
  source?: string;
  bedsAvailable?: number;
  icuBedsAvailable?: number;
  fetchedAt?: string;
}

const SERVICE_TYPES = [
  { id: 'Hospital', label: 'HOSPITALS', icon: Hospital, color: 'text-(--color-emergency)', bg: 'bg-emergency/10' },
  { id: 'Police Station', label: 'POLICE', icon: Shield, color: 'text-navy', bg: 'bg-navy/10' },
  { id: 'Fire Station', label: 'FIRE', icon: Flame, color: 'text-amber', bg: 'bg-amber/10' },
  { id: 'Pharmacy', label: 'DRUGS', icon: Pill, color: 'text-(--color-safe)', bg: 'bg-safe/10' }
];

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const formatDistance = (km: number) => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

export const NearbyServicesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Hospital');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchNearbyServices = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);
      let fetchedServices: Service[] = [];

      try {
        const hospRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/hospitals/nearby`, {
          params: { lat, lng }
        });
        if (hospRes.data.services) {
          fetchedServices = hospRes.data.services.map((s: any) => ({
            ...s,
            distance: haversine(lat, lng, s.lat, s.lng)
          }));
        }
      } catch(e) { logger.error(e); }

      // Fallback/Hybrid fetch
      if (fetchedServices.length === 0) {
        try {
          const osmRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/nearby-osm`, {
            params: { lat, lng, radius: 10000 }
          });
          if (osmRes.data.services) {
            fetchedServices = osmRes.data.services.map((s: any) => ({
              ...s,
              distance: haversine(lat, lng, s.lat, s.lng)
            }));
          }
        } catch(e) { logger.error(e); }
      }

      const sorted = fetchedServices.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setServices(sorted);
      
      // Cache
      await db.nearbyServices.clear();
      await db.nearbyServices.bulkAdd(sorted.map(s => ({ ...s, fetchedAt: new Date().toISOString() })));

    } catch (err) {
      logger.error(err);
      const cached = await db.nearbyServices.toArray();
      if (cached.length > 0) setServices(cached as Service[]);
      else setError('No services found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        fetchNearbyServices(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        const def = { lat: 13.0617, lng: 80.2520 };
        setUserLocation(def);
        fetchNearbyServices(def.lat, def.lng);
      }
    );

    const socket = getSocket();
    socket.on('hospital_updates', (updates: any[]) => {
      setServices(prev => prev.map(s => {
        const u = updates.find(update => update.id === s.id);
        return u ? { ...s, ...u } : s;
      }));
    });
    return () => { socket.off('hospital_updates'); };
  }, []);

  const filtered = services.filter(s => s.type === activeTab);

  return (
    <div className="p-6 space-y-10 max-w-4xl mx-auto pb-32">
      <header className="flex flex-col gap-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-(--color-safe) rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none text-(--app-text)">NEARBY HELP</h1>
              <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">Verified Medical & Safety</p>
            </div>
          </div>
          <button 
            onClick={() => userLocation && fetchNearbyServices(userLocation.lat, userLocation.lng)}
            className="w-14 h-14 bg-(--app-surface) border-4 border-(--app-border) rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
            title="Refresh Services"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {SERVICE_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            className={`flex flex-col items-center justify-center p-6 rounded-4xl border-4 transition-all active:scale-95 ${
              activeTab === type.id
              ? `bg-(--app-surface) border-navy text-navy shadow-xl`
              : 'bg-(--app-surface) border-(--app-border) text-(--app-text) opacity-40'
            }`}
          >
            <type.icon size={32} strokeWidth={3} />
            <span className="text-[10px] font-black mt-2 tracking-widest uppercase">{type.label}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-(--app-surface) animate-pulse rounded-[2.5rem] border-4 border-(--app-border)" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filtered.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-(--app-surface) p-8 rounded-[3rem] border-4 border-(--app-border) shadow-xl space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-navy/10 text-navy text-xs font-black rounded-xl uppercase tracking-widest">
                        {service.distance ? formatDistance(service.distance) : '...'}
                      </div>
                      <div className="px-3 py-1 bg-navy/10 text-navy text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck size={12} /> OSM VERIFIED
                      </div>
                      {service.isOpen && (
                        <div className="px-3 py-1 bg-safe/10 text-(--color-safe) text-xs font-black rounded-xl uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} /> OPEN
                        </div>
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-(--app-text) leading-tight tracking-tight uppercase italic">{service.name}</h3>
                    <p className="text-base font-bold opacity-50">{service.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-[10px] font-mono text-(--clr-text-2) opacity-50">
                      LAST UPDATED: {service.fetchedAt ? new Date(service.fetchedAt).toLocaleTimeString() : 'JUST NOW'}
                    </div>
                    {service.bedsAvailable !== undefined && (
                      <div className={`px-4 py-2 rounded-2xl text-lg font-black tracking-tighter shadow-sm border-2 ${
                        service.bedsAvailable > 5 ? 'bg-safe/10 border-(--color-safe)/20 text-(--color-safe)' : 'bg-emergency/10 border-(--color-emergency)/20 text-(--color-emergency)'
                      }`}>
                        {service.bedsAvailable} BEDS
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {service.phone && (
                    <a 
                      href={`tel:${service.phone}`}
                      className="h-20 bg-navy text-white rounded-3xl flex items-center justify-center gap-4 text-xl font-black uppercase tracking-tighter shadow-lg active:scale-95 transition-transform"
                    >
                      <Phone size={28} /> CALL
                    </a>
                  )}
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-20 bg-(--color-safe) text-white rounded-3xl flex items-center justify-center gap-4 text-xl font-black uppercase tracking-tighter shadow-lg active:scale-95 transition-transform"
                  >
                    <Navigation size={28} /> GO
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center space-y-6 bg-(--app-surface) rounded-[3rem] border-4 border-dashed border-(--app-border)">
            <MapPin size={64} className="mx-auto opacity-20" />
            <p className="text-xl font-black opacity-40 uppercase tracking-widest">No results nearby</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-red-400 text-xs font-medium text-center">{error}</p>
        </div>
      )}
    </div>
  );
};
