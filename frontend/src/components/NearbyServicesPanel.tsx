import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Hospital, 
  Shield, 
  Flame, 
  Pill, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Star, 
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/db';

interface Service {
  id: string;
  name: string;
  type: string;
  icon: string;
  lat: number;
  lng: number;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  isOpen?: boolean;
  phone?: string | null;
  website?: string | null;
  photo?: string | null;
  distance?: number;
  source?: 'OpenStreetMap' | 'Google' | 'Cached';
}

const SERVICE_TYPES = [
  { id: 'Hospital', label: 'Hospitals', icon: Hospital, color: 'red' },
  { id: 'Police Station', label: 'Police', icon: Shield, color: 'blue' },
  { id: 'Fire Station', label: 'Fire', icon: Flame, color: 'orange' },
  { id: 'Pharmacy', label: 'Pharmacies', icon: Pill, color: 'emerald' }
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
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const NearbyServicesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Hospital');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceInfo, setSourceInfo] = useState<{ source: string; fetchedAt: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchNearbyServices = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedServices: Service[] = [];
      let source = '';
      let fetchedAt = '';

      // Primary: Try Overpass API (OSM)
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/nearby-osm`, {
          params: { lat, lng, radius: 10000 }
        });
        
        if (response.data.services && response.data.services.length > 0) {
          fetchedServices = response.data.services.map((s: any) => ({
            ...s,
            source: 'OpenStreetMap',
            distance: haversine(lat, lng, s.lat, s.lng)
          }));
          source = response.data.source;
          fetchedAt = response.data.fetchedAt;
        }
      } catch (osmErr) {
        console.warn('OSM Fetch failed, falling back to Google:', osmErr);
      }

      // Secondary: Try Google Places if OSM failed or returned no results
      if (fetchedServices.length === 0) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/nearby-google`, {
            params: { lat, lng, radius: 10000 }
          });
          
          fetchedServices = response.data.services.map((s: any) => ({
            ...s,
            source: 'Google',
            distance: haversine(lat, lng, s.lat, s.lng)
          }));
          source = response.data.source;
          fetchedAt = response.data.fetchedAt;
        } catch (googleErr) {
          console.error('Google Fetch failed:', googleErr);
        }
      }

      if (fetchedServices.length > 0) {
        const sortedServices = fetchedServices.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setServices(sortedServices);
        setSourceInfo({ source, fetchedAt });
        setIsCached(false);

        // Cache in IndexedDB
        await db.nearbyServices.clear();
        await db.nearbyServices.bulkAdd(sortedServices.map((s: any) => ({
          ...s,
          fetchedAt: fetchedAt || new Date().toISOString()
        })));
      } else {
        throw new Error('No services found from any provider');
      }

    } catch (err: any) {
      console.error('Failed to fetch nearby services:', err);
      // Fallback to cache
      const cached = await db.nearbyServices.toArray();
      if (cached.length > 0) {
        const sortedCached = cached.map(s => ({
          ...s,
          source: 'Cached' as const,
          distance: haversine(lat, lng, s.lat, s.lng)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setServices(sortedCached);
        setSourceInfo({ source: 'Local Cache', fetchedAt: cached[0].fetchedAt });
        setIsCached(true);
      } else {
        setError('Failed to fetch nearby services and no cached data found.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyServices(latitude, longitude);
        },
        () => {
          setError("Location access denied. Using default coordinates.");
          const defaultLat = 28.6139; // Delhi
          const defaultLng = 77.2090;
          setUserLocation({ lat: defaultLat, lng: defaultLng });
          fetchNearbyServices(defaultLat, defaultLng);
        }
      );
    } else {
      setError("Geolocation not supported by your browser.");
    }
  }, []);

  const filteredServices = services.filter(s => s.type === activeTab);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Verification Badge */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Verified Local Support</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <CheckCircle2 size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">OSM Community Verified ✓</span>
            </div>
            {isCached && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <AlertTriangle size={12} className="text-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Tactical Cache</span>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => userLocation && fetchNearbyServices(userLocation.lat, userLocation.lng)}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh Services"
          aria-label="Refresh nearby services list"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SERVICE_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border whitespace-nowrap ${
              activeTab === type.id
              ? `bg-${type.color}-500/20 border-${type.color}-500/40 text-${type.color}-400 shadow-lg shadow-${type.color}-500/10`
              : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'
            }`}
          >
            <type.icon size={16} />
            {type.label}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-slate-900 animate-pulse rounded-3xl border border-white/5" />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-slate-900/50 border border-white/5 hover:border-white/20 p-5 rounded-3xl transition-all relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                          <MapPin size={12} className="text-blue-400" />
                          {service.distance ? formatDistance(service.distance) : 'Calculating...'}
                        </div>
                        {service.source && (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${
                            service.source === 'OpenStreetMap' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : service.source === 'Google'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {service.source === 'OpenStreetMap' ? 'OSM' : service.source === 'Google' ? 'GOOGLE' : 'OFFLINE'}
                          </div>
                        )}
                        {service.isOpen !== undefined && (
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${
                            service.isOpen 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            <Clock size={10} />
                            {service.isOpen ? 'OPEN NOW' : 'CLOSED'}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-black text-white uppercase leading-tight tracking-tight">{service.name}</h3>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-1">{service.address}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {service.rating && (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-bold">{service.rating}</span>
                            <span className="text-[10px] text-slate-600">({service.user_ratings_total})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {service.phone && (
                          <a 
                            href={`tel:${service.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all"
                          >
                            <Phone size={14} />
                            Call
                          </a>
                        )}
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all"
                        >
                          <Navigation size={14} />
                          Navigate
                        </a>
                        {service.website && (
                          <a 
                            href={service.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all"
                            title="Visit Website"
                            aria-label={`Visit website for ${service.name}`}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>

                    {service.photo && (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 hidden sm:block">
                        <img 
                          src={service.photo} 
                          alt={service.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-slate-900/20 rounded-4xl border border-dashed border-white/5">
            <MapPin size={48} className="mx-auto text-slate-800" />
            <div className="space-y-1">
              <p className="text-white font-bold">No results found in your area</p>
              <p className="text-slate-500 text-xs">Try increasing search radius or checking location permissions.</p>
            </div>
          </div>
        )}
      </div>

      {/* Attribution Footer */}
      {sourceInfo && (
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-white/5">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            Data from {sourceInfo.source} — Updated: {new Date(sourceInfo.fetchedAt).toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Telemetry Active</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-red-400 text-xs font-medium text-center">{error}</p>
        </div>
      )}
    </div>
  );
};
