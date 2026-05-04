import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, 
  Wrench, 
  Car, 
  Fuel, 
  Phone, 
  Navigation, 
  Save, 
  MapPin, 
  ArrowRight,
  Loader2,
  Star,
  Search,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/db';

interface VehicleService {
  id: string;
  name: string;
  category: 'Towing' | 'Puncture' | 'Showroom' | 'Fuel' | 'Mechanic';
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
  distance?: number;
  source?: 'OpenStreetMap' | 'Google' | 'Cached';
}

const CATEGORIES = [
  { id: 'Towing', label: 'Towing', icon: Truck, color: 'blue' },
  { id: 'Puncture', label: 'Puncture', icon: Wrench, color: 'amber' },
  { id: 'Showroom', label: 'Showroom', icon: Car, color: 'purple' },
  { id: 'Fuel', label: 'Fuel', icon: Fuel, color: 'emerald' },
  { id: 'Mechanic', label: 'Mechanic', icon: Wrench, color: 'indigo' }
] as const;

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

export const VehicleServicesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Towing');
  const [services, setServices] = useState<VehicleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(10); // km
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchServices = async (lat: number, lng: number, r: number) => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedServices: VehicleService[] = [];

      // Primary: Try OSM
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/services/nearby-osm`, {
          params: { lat, lng, radius: r * 1000 }
        });
        if (response.data.services && response.data.services.length > 0) {
          fetchedServices = response.data.services.map((s: VehicleService) => ({
            ...s,
            source: 'OpenStreetMap',
            distance: haversine(lat, lng, s.lat, s.lng)
          }));
        }
      } catch (osmErr) {
        console.warn('OSM Fetch failed for vehicle services:', osmErr);
      }

      // Secondary: Try Google if OSM failed or returned no results
      if (fetchedServices.length === 0) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/services/vehicle-services`, {
            params: { lat, lng, radius: r * 1000 }
          });
          fetchedServices = response.data.services.map((s: VehicleService) => ({
            ...s,
            source: 'Google',
            distance: haversine(lat, lng, s.lat, s.lng)
          }));
        } catch (googleErr) {
          console.error('Google Fetch failed for vehicle services:', googleErr);
        }
      }

      if (fetchedServices.length > 0) {
        const sorted = fetchedServices.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setServices(sorted);
        setIsOffline(false);
      } else {
        throw new Error('No services found');
      }

    } catch (err: unknown) {
      console.error('Failed to fetch vehicle services:', err);
      const cached = await db.nearbyServices.where('category').anyOf(['Towing', 'Puncture', 'Showroom', 'Fuel', 'Mechanic']).toArray();
      if (cached.length > 0) {
        setServices(cached.map(s => ({ ...s, source: 'Cached' as const })) as unknown as VehicleService[]);
        setIsOffline(true);
      } else {
        setError('Failed to fetch services and no offline data available.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          fetchServices(loc.lat, loc.lng, radius);
        },
        () => {
          setError("Geolocation access denied. Using default location (New Delhi).");
          const loc = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(loc);
          fetchServices(loc.lat, loc.lng, radius);
        }
      );
    }
  }, [radius]);

  const handleSaveArea = async () => {
    if (services.length === 0) return;
    try {
      await db.nearbyServices.where('category').anyOf(['Towing', 'Puncture', 'Showroom', 'Fuel', 'Mechanic']).delete();
      await db.nearbyServices.bulkAdd(services.map(s => ({
        ...s,
        fetchedAt: new Date().toISOString()
      })));
      alert("Area services saved for offline use.");
    } catch (err) {
      console.error("Failed to save area:", err);
    }
  };

  const handleEmergencyTowing = () => {
    if (!userLocation) return;
    const message = `EMERGENCY: My vehicle is stranded at ${userLocation.lat}, ${userLocation.lng}. I need immediate towing assistance. Link: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    const waLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  const filteredServices = services.filter(s => s.category === activeTab);

  return (
    <div className="flex flex-col h-full bg-(--nx-bg-base) overflow-hidden">
      {/* Header Section */}
      <div className="p-6 bg-(--nx-bg-surface) border-b border-(--nx-border) space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Vehicle Support</h1>
            <p className="text-[10px] text-nx-text-dim uppercase tracking-widest mt-1">
              {isOffline ? 'Offline Mode' : `${services.length} Units Online`}
            </p>
          </div>
          <button 
            onClick={handleSaveArea}
            className="flex items-center gap-2 px-4 py-2 bg-white/2 border border-white/5 rounded-lg text-[10px] font-bold text-white uppercase hover:bg-white/5 transition-all"
          >
            <Save size={14} className="text-nx-blue-primary" />
            Save Area
          </button>
        </div>

        {/* Emergency CTA */}
        <button 
          onClick={handleEmergencyTowing}
          className="w-full group relative overflow-hidden bg-nx-red-primary p-4 rounded-xl flex items-center justify-between transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-nx-red-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Truck size={24} className="text-white" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-black text-white uppercase leading-none">Emergency Towing</span>
              <span className="text-[10px] text-white/70 uppercase tracking-widest">Share Location via WhatsApp</span>
            </div>
          </div>
          <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={20} />
        </button>

        {/* Category Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shrink-0 ${
                activeTab === cat.id 
                ? 'bg-nx-blue-primary/10 border-nx-blue-primary/50 text-nx-blue-primary'
                : 'bg-white/2 border-white/5 text-nx-text-dim hover:text-white'
              }`}
            >
              <cat.icon size={16} />
              <span className="text-xs font-black uppercase tracking-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Radius Filter */}
        <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-nx-text-dim uppercase tracking-widest">Search Radius</span>
            <span className="text-nx-blue-primary font-mono">{radius}km</span>
          </div>
          <input 
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            title="Search Radius Slider"
            className="w-full accent-nx-blue-primary"
          />
        </div>

        {error && (
          <div className="bg-nx-red-primary/10 border border-nx-red-primary/20 rounded-2xl p-4 flex items-center gap-3 text-nx-red-primary">
            <AlertTriangle size={20} />
            <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-nx-text-dim">
              <Loader2 className="animate-spin text-nx-blue-primary" size={32} />
              <p className="font-mono text-sm uppercase tracking-widest">Scanning Grid...</p>
            </div>
          ) : filteredServices.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative bg-white/2 border ${expandedId === service.id ? 'border-nx-blue-primary/50' : 'border-white/5'} rounded-2xl overflow-hidden hover:bg-white/5 transition-all`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-nx-blue-primary/10 rounded-xl">
                          {React.createElement(CATEGORIES.find(c => c.id === activeTab)?.icon || Truck, {
                            size: 24,
                            className: "text-nx-blue-primary"
                          })}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-nx-blue-primary transition-colors uppercase tracking-tight">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-nx-text-dim uppercase font-bold tracking-widest">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-nx-blue-primary" />
                              {service.distance?.toFixed(1)}km
                            </span>
                            {service.rating && (
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star size={12} fill="currentColor" />
                                {service.rating} ({service.user_ratings_total})
                              </span>
                            )}
                            {service.source && (
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${
                                service.source === 'OpenStreetMap' 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : service.source === 'Google'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {service.source === 'OpenStreetMap' ? 'OSM' : service.source === 'Google' ? 'GOOGLE' : 'OFFLINE'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === service.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-white/5">
                            <p className="text-xs text-nx-text-dim leading-relaxed uppercase font-bold tracking-tight">
                              {service.address}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 border-t border-white/5 bg-black/20">
                    <a 
                      href={`tel:${service.phone || '+910000000000'}`}
                      className="flex items-center justify-center gap-2 py-4 hover:bg-emerald-500/10 text-emerald-400 transition-all border-r border-white/5"
                    >
                      <Phone size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Call Now</span>
                    </a>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-4 hover:bg-white/5 text-white transition-all"
                    >
                      <Navigation size={16} className="text-nx-blue-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Directions</span>
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-50">
              <Search size={48} className="text-nx-text-dim" />
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase tracking-tighter">No Units Found</p>
                <p className="text-[10px] text-nx-text-dim uppercase tracking-widest mt-1">Try expanding search radius</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
