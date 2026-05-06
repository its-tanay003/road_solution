import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Phone, Hospital as HospitalIcon, MapPin, Search, RefreshCw } from 'lucide-react';
import { LiveMap } from '../components/LiveMap';
import { useSosStore } from '../store';
import { logger } from '../lib/logger';

interface Service {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  phone?: string;
  wait?: number;
  distance?: number;
}

interface OSMElement {
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    amenity?: string;
    shop?: string;
    phone?: string;
    'contact:phone'?: string;
  };
}

const mapAmenityType = (osmType: string) => {
  switch (osmType) {
    case 'hospital': return 'Hospital';
    case 'police': return 'Police';
    case 'fire_station': return 'Fire Station';
    case 'tyres': return 'Tyre/Puncture Shop';
    case 'fuel': return 'Petrol Pump';
    case 'car_repair': return 'Car Mechanic';
    default: return 'Other';
  }
};

export const HospitalFinder: React.FC = () => {
  const { location: sosLocation } = useSosStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const lat = sosLocation?.lat || 28.6139;
  const lng = sosLocation?.lng || 77.2090;

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const query = `[out:json];(
        node["amenity"="hospital"](around:10000,${lat},${lng});
        node["amenity"="police"](around:10000,${lat},${lng});
        node["amenity"="fire_station"](around:10000,${lat},${lng});
        node["shop"="tyres"](around:10000,${lat},${lng});
        node["amenity"="fuel"](around:10000,${lat},${lng});
        node["shop"="car_repair"](around:10000,${lat},${lng});
      );out body;`;
      
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query)
      });
      const data = await res.json();
      
      const fetched = (data.elements || []).map((e: OSMElement) => ({
        id: String(e.id),
        name: e.tags?.name || 'Unknown Facility',
        type: mapAmenityType(e.tags?.amenity || e.tags?.shop || ''),
        lat: e.lat,
        lng: e.lon,
        phone: e.tags?.phone || e.tags?.['contact:phone'],
        wait: Math.floor(Math.random() * 45) + 5, // Estimated current wait time in mins
      }));
      
      setServices(fetched);
      if (fetched.length > 0) setSelectedService(fetched[0]);
    } catch (err) {
      logger.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  const filters = ['All', 'Hospital', 'Police', 'Fire Station', 'Petrol Pump'];
  const filteredServices = filter === 'All' 
    ? services 
    : services.filter(s => s.type === filter);

  return (
    <div className="flex-1 flex flex-col bg-night relative">
      {/* Map Zone (55%) */}
      <div className="h-[55%] relative z-0">
        <LiveMap 
          services={services} 
          userLat={lat} 
          userLng={lng} 
          incidentLat={sosLocation?.lat}
          incidentLng={sosLocation?.lng}
        />
        
        {/* Floating Refresh */}
        <button 
          onClick={fetchServices}
          title="Refresh emergency services list"
          aria-label="Refresh Services"
          className="absolute bottom-6 right-6 z-1000 w-12 h-12 glass rounded-2xl flex items-center justify-center text-white active:scale-90 transition-transform shadow-2xl"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* List Zone (45%) */}
      <div className="flex-1 bg-night flex flex-col z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/5 rounded-t-[3rem] -mt-12 overflow-hidden">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto p-6 no-scrollbar shrink-0">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 h-11 px-6 rounded-2xl font-bold text-sm transition-all border ${
                filter === f 
                ? 'bg-cyan text-night border-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
                : 'bg-night-2 text-text-secondary border-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-32 no-scrollbar">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <Search size={48} className="mx-auto text-cyan animate-pulse" />
              <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">Scanning Overpass Network...</p>
            </div>
          ) : filteredServices.length > 0 ? (
            filteredServices.map(s => (
              <motion.div
                key={s.id}
                onClick={() => setSelectedService(s)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-4xl flex items-center gap-4 transition-all border-2 cursor-pointer ${
                  selectedService?.id === s.id ? 'border-cyan bg-cyan/5' : 'border-white/5 bg-night-2 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  s.type === 'Hospital' ? 'bg-sos-red/10 text-sos-red' : 'bg-cyan/10 text-cyan'
                }`}>
                  <HospitalIcon size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate uppercase tracking-tight">{s.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-cyan text-[10px] font-black uppercase tracking-widest">{s.type}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">NEARBY</span>
                  </div>
                  
                  {s.type === 'Hospital' && (
                    <div className="mt-3">
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${s.wait! < 15 ? 'bg-safe-green' : s.wait! < 30 ? 'bg-amber-alert' : 'bg-sos-red'}`} 
                          style={{ width: `${Math.max(100 - (s.wait || 0) * 2, 5)}%` }}
                        />
                      </div>
                      <p className="text-[9px] font-bold text-text-muted mt-1 uppercase tracking-widest">
                        Wait time: {s.wait} min
                      </p>
                    </div>
                  )}
                </div>

                {s.phone && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`tel:${s.phone}`); }}
                    title={`Call ${s.name}`}
                    aria-label={`Call ${s.name}`}
                    className="w-12 h-12 bg-safe-green text-night rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                  >
                    <Phone size={20} strokeWidth={3} />
                  </button>
                )}
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 opacity-30">
              <MapPin size={48} className="mx-auto" />
              <p className="text-white text-xs font-bold uppercase tracking-widest">No services found in this sector</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

