import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, 
  Wrench, 
  Fuel, 
  Phone, 
  Navigation, 
  Save, 
  ArrowRight,
  Star,
  Search,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/db';
import { logger } from '../lib/logger';

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
  { id: 'Towing', label: 'TOWING', icon: Truck },
  { id: 'Puncture', label: 'REPAIR', icon: Wrench },
  { id: 'Mechanic', label: 'GARAGE', icon: Wrench },
  { id: 'Fuel', label: 'FUEL', icon: Fuel }
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

  const fetchServices = async (lat: number, lng: number, r: number) => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedServices: VehicleService[] = [];

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/nearby-osm`, {
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
        logger.warn('OSM Fetch failed for vehicle services:', osmErr);
      }

      if (fetchedServices.length === 0) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/services/vehicle-services`, {
            params: { lat, lng, radius: r * 1000 }
          });
          fetchedServices = response.data.services.map((s: VehicleService) => ({
            ...s,
            source: 'Google',
            distance: haversine(lat, lng, s.lat, s.lng)
          }));
        } catch (googleErr) {
          logger.error('Google Fetch failed for vehicle services:', googleErr);
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
      logger.error('Failed to fetch vehicle services:', err);
      const cached = await db.nearbyServices.where('category').anyOf(['Towing', 'Puncture', 'Mechanic', 'Fuel']).toArray();
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
      await db.nearbyServices.where('category').anyOf(['Towing', 'Puncture', 'Mechanic', 'Fuel']).delete();
      await db.nearbyServices.bulkAdd(services.map(s => ({
        ...s,
        fetchedAt: new Date().toISOString()
      })));
    } catch (err) {
      logger.error("Failed to save area:", err);
    }
  };

  const handleEmergencyTowing = () => {
    if (!userLocation) return;
    const message = `EMERGENCY: Vehicle stranded at ${userLocation.lat}, ${userLocation.lng}. Need towing. https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredServices = services.filter(s => s.category === activeTab);

  return (
    <div className="flex flex-col h-full bg-(--app-bg) text-(--app-text) font-sans overflow-hidden">
      {/* Header */}
      <div className="p-8 bg-(--app-surface) border-b-4 border-(--app-border) space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">ROADSIDE HELP</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-amber' : 'bg-safe'}`} />
              <p className="text-xs font-black uppercase tracking-widest opacity-40">
                {isOffline ? 'OFFLINE DATABASE' : 'SYSTEMS ONLINE'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSaveArea}
            title="Save area for offline use"
            aria-label="Save area for offline use"
            className="w-16 h-16 bg-(--app-bg) border-4 border-(--app-border) rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <Save size={28} />
          </button>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-4xl border-4 transition-all active:scale-95 ${
                activeTab === cat.id
                ? 'bg-(--app-bg) border-navy text-navy shadow-lg'
                : 'bg-(--app-bg) border-(--app-border) opacity-40'
              }`}
            >
              <cat.icon size={32} strokeWidth={3} />
              <span className="text-[10px] font-black mt-2 tracking-widest uppercase">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* SOS Towing */}
        <button 
          onClick={handleEmergencyTowing}
          className="w-full h-24 bg-emergency text-white rounded-4xl flex items-center justify-between px-8 shadow-xl active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-6">
            <Truck size={40} strokeWidth={3} />
            <div className="text-left">
              <span className="block text-2xl font-black uppercase italic tracking-tighter">SOS TOWING</span>
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Share Location to WhatsApp</span>
            </div>
          </div>
          <ArrowRight size={32} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-black opacity-40 uppercase tracking-widest">Search Radius</span>
            <span className="text-2xl font-black text-navy">{radius}KM</span>
          </div>
          <input 
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            title="Search Radius Slider"
            aria-label="Search Radius"
            className="w-full h-12 accent-navy"
          />
        </div>

        {error && (
          <div className="p-6 bg-emergency/10 border-4 border-emergency/20 rounded-3xl flex items-center gap-4 text-emergency">
            <AlertTriangle size={32} />
            <p className="text-lg font-black uppercase tracking-tight">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-20">
              <RefreshCw size={64} className="animate-spin" />
              <p className="text-xl font-black uppercase tracking-widest">Scanning Grid...</p>
            </div>
          ) : filteredServices.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-(--app-surface) border-4 border-(--app-border) rounded-4xl p-8 shadow-xl space-y-8"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-navy/10 text-navy text-xs font-black rounded-xl uppercase tracking-widest">
                          {service.distance?.toFixed(1)}KM
                        </div>
                        {service.rating && (
                          <div className="flex items-center gap-1 text-amber text-sm font-black">
                            <Star size={14} fill="currentColor" />
                            {service.rating}
                          </div>
                        )}
                      </div>
                      <h3 className="text-3xl font-black text-(--app-text) leading-none tracking-tight uppercase italic">
                        {service.name}
                      </h3>
                      <p className="text-base font-bold opacity-50">{service.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href={`tel:${service.phone || '+910000000000'}`}
                      className="h-20 bg-navy text-white rounded-3xl flex items-center justify-center gap-4 text-xl font-black uppercase tracking-tighter shadow-lg active:scale-95 transition-transform"
                    >
                      <Phone size={28} /> CALL
                    </a>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-20 bg-safe text-white rounded-3xl flex items-center justify-center gap-4 text-xl font-black uppercase tracking-tighter shadow-lg active:scale-95 transition-transform"
                    >
                      <Navigation size={28} /> GO
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-20 text-center space-y-6 opacity-20 border-4 border-dashed border-(--app-border) rounded-[3rem]">
              <Search size={64} className="mx-auto" />
              <p className="text-xl font-black uppercase tracking-widest">No Help Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
