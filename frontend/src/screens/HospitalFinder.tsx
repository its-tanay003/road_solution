import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Phone, Hospital } from 'lucide-react';

// Custom Marker Icon
const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGMTc0NCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJNOCAxMWh2Mmg4di0yaC04eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMSA4aDJ2OGgtMnoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwRTVGRiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjExIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMEU1RkYiIHN0cm9rZS13aWR0aD0iMSI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iciIgdmFsdWVzPSIzOzExIiBkdXI9IjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjAuNTswIiBkdXI9IjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz48L2NpcmNsZT48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MOCK_HOSPITALS = [
  { id: 1, name: "Apollo Trauma Centre", type: "Trauma", lat: 28.6139, lng: 77.2090, wait: 12, phone: "1066" },
  { id: 2, name: "AIIMS Emergency", type: "Govt", lat: 28.5672, lng: 77.2100, wait: 45, phone: "011-26588500" },
  { id: 3, name: "Max Super Speciality", type: "24/7", lat: 28.5276, lng: 77.2104, wait: 8, phone: "011-26515050" },
  { id: 4, name: "Fortis Escorts", type: "Trauma", lat: 28.5606, lng: 77.2727, wait: 15, phone: "011-47135000" },
];

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
};

export const HospitalFinder: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [selectedHospital, setSelectedHospital] = useState(MOCK_HOSPITALS[0]);
  const filters = ['All', 'Trauma', 'Govt', '24/7'];

  const filteredHospitals = filter === 'All' 
    ? MOCK_HOSPITALS 
    : MOCK_HOSPITALS.filter(h => h.type === filter);

  return (
    <div className="flex-1 flex flex-col bg-night relative">
      {/* Map Zone (55%) */}
      <div className="h-[55%] relative z-0">
        <MapContainer 
          center={[selectedHospital.lat, selectedHospital.lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapController center={[selectedHospital.lat, selectedHospital.lng]} />
          
          <Marker position={[28.6, 77.21]} icon={userIcon} />
          
          {filteredHospitals.map(h => (
            <Marker 
              key={h.id} 
              position={[h.lat, h.lng]} 
              icon={hospitalIcon}
              eventHandlers={{ click: () => setSelectedHospital(h) }}
            >
              <Popup className="tactical-popup">
                <div className="p-2">
                  <h4 className="font-bold text-white">{h.name}</h4>
                  <p className="text-cyan text-[10px] uppercase font-black">{h.type} Center</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Controls */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
          <button aria-label="Zoom in" className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white active:scale-90 transition-transform">
            <span className="text-xl font-bold">+</span>
          </button>
          <button aria-label="Zoom out" className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white active:scale-90 transition-transform">
            <span className="text-xl font-bold">−</span>
          </button>
        </div>
      </div>

      {/* List Zone (45%) */}
      <div className="flex-1 bg-night flex flex-col z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/5 rounded-t-[3rem] -mt-12">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto p-6 no-scrollbar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 h-11 px-6 rounded-2xl font-bold text-sm transition-all border ${
                filter === f 
                ? 'bg-cyan text-night border-cyan' 
                : 'bg-night-2 text-text-secondary border-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Hospital List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-32 no-scrollbar">
          {filteredHospitals.map(h => (
            <motion.div
              key={h.id}
              onClick={() => setSelectedHospital(h)}
              className={`p-5 rounded-4xl flex items-center gap-4 transition-all border-2 cursor-pointer ${
                selectedHospital.id === h.id ? 'border-cyan bg-cyan/5' : 'border-white/5 bg-night-2'
              }`}
            >
              <div className="w-12 h-12 bg-sos-red/10 rounded-2xl flex items-center justify-center">
                <Hospital size={24} className="text-sos-red" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold truncate">{h.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-cyan text-[10px] font-black uppercase tracking-widest">{h.type}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">2.4 KM</span>
                </div>
                {/* ER Wait Time Bar */}
                <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(100 - h.wait * 2, 5)}%` }}
                    className={`h-full ${h.wait < 15 ? 'bg-safe-green' : h.wait < 30 ? 'bg-amber-alert' : 'bg-sos-red'}`} 
                  />
                </div>
                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">
                  Wait time: {h.wait} min
                </p>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); window.open(`tel:${h.phone}`); }}
                aria-label={`Call ${h.name}`}
                className="w-12 h-12 bg-safe-green text-night rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <Phone size={20} strokeWidth={3} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .tactical-popup .leaflet-popup-content-wrapper {
          background: #0A1628 !important;
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 16px;
        }
        .tactical-popup .leaflet-popup-tip {
          background: #0A1628 !important;
        }
      `}</style>
    </div>
  );
};
