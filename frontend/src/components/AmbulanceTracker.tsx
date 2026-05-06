import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Activity, 
  User,
  AlertTriangle,
  ChevronRight,
  Maximize2,
  X
} from 'lucide-react';
import { useAmbulanceStore, useSosStore, type Ambulance } from '../store';
import 'leaflet/dist/leaflet.css';
import { logger } from '../lib/logger';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Ambulance Marker Component
const AmbulanceMarker = ({ ambulance, isDispatched }: { ambulance: Ambulance, isDispatched: boolean }) => {
  const getIconColor = () => {
    switch (ambulance.status) {
      case 'AVAILABLE': return '#10b981'; // Green
      case 'DISPATCHED': return '#ef4444'; // Red
      case 'ON_SCENE': return '#f59e0b'; // Amber
      default: return '#6366f1'; // Indigo
    }
  };

  const icon = L.divIcon({
    className: 'custom-ambulance-icon',
    html: `
      <div class="relative flex items-center justify-center">
        ${isDispatched ? '<div class="absolute w-12 h-12 bg-red-500/20 rounded-full animate-ping"></div>' : ''}
        <div class="relative z-10 w-10 h-10 bg-slate-900 border-2 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300" style="border-color: ${getIconColor()}; transform: rotate(${ambulance.heading}deg)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${getIconColor()}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 10H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12"></path>
            <path d="M19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path>
            <path d="M7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path>
            <path d="M17 17h2a2 2 0 0 0 2-2v-4a5 5 0 0 0-5-5h-2"></path>
            <path d="M14 6h1"></path>
          </svg>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center border border-slate-900">
             <div class="w-1.5 h-1.5 rounded-full ${ambulance.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-red-500'}"></div>
          </div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <Marker position={[ambulance.currentLat, ambulance.currentLng]} icon={icon}>
      <Popup className="tactical-popup">
        <div className="p-3 bg-slate-950 text-white min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unit ID</span>
            <span className="text-[10px] font-black text-white bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">{ambulance.unitId}</span>
          </div>
          <h3 className="text-sm font-black uppercase tracking-tight mb-3">EMRI 108 Service</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <User size={14} className="text-blue-400" />
              <div>
                <p className="text-[8px] uppercase text-slate-500 font-bold leading-none">Crew</p>
                <p className="text-[10px] font-bold text-white uppercase">{ambulance.driver} / {ambulance.paramedic}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <div>
                <p className="text-[8px] uppercase text-slate-500 font-bold leading-none">Status</p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{ambulance.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-red-400" />
              <div>
                <p className="text-[8px] uppercase text-slate-500 font-bold leading-none">Type</p>
                <p className="text-[10px] font-bold text-white uppercase">{ambulance.type === 'ALS' ? 'Advanced Life Support' : 'Basic Life Support'}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Certifications</p>
            <div className="flex flex-wrap gap-1">
              {ambulance.certifications.map((c: string) => (
                <span key={c} className="text-[7px] font-black px-1.5 py-0.5 bg-white/5 border border-white/10 rounded uppercase">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Map Controller for Zooming/Panning
const MapController = ({ center, isFull }: { center: [number, number], isFull: boolean }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, isFull ? 15 : 13);
  }, [center, isFull, map]);
  return null;
};

export const AmbulanceTracker: React.FC = () => {
  const { ambulances, dispatchedUnitId, eta, distance, initializeFleet, dispatchAmbulance, tick } = useAmbulanceStore();
  const { location } = useSosStore();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const telemetryInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize fleet near user
  useEffect(() => {
    if (location && ambulances.length === 0) {
      initializeFleet(location);
    }
  }, [location, ambulances.length, initializeFleet]);

  // Operational Telemetry Loop
  useEffect(() => {
    if (dispatchedUnitId) {
      telemetryInterval.current = setInterval(() => {
        tick();
      }, 500);
    } else {
      if (telemetryInterval.current) clearInterval(telemetryInterval.current);
    }
    return () => {
      if (telemetryInterval.current) clearInterval(telemetryInterval.current);
    };
  }, [dispatchedUnitId, tick]);

  const handleDispatch = async (unitId: string) => {
    if (!location) return;
    const unit = ambulances.find(a => a.unitId === unitId);
    if (!unit) return;

    try {
      // OSRM Routing
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${unit.currentLng},${unit.currentLat};${location.lng},${location.lat}?overview=full&geometries=geojson`);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route: [number, number][] = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]); // Swap to [lat, lng]
        const duration = data.routes[0].duration;
        const dist = data.routes[0].distance;

        dispatchAmbulance(unitId, route, duration, dist);
        setNotification(`Ambulance ${unitId} dispatched — ETA ${Math.floor(duration/60)} min ${Math.floor(duration%60)} sec`);
        
        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }

        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      logger.error('Routing failed:', err);
    }
  };

  const dispatchedUnit = ambulances.find(a => a.unitId === dispatchedUnitId);
  const mapCenter: [number, number] = location ? [location.lat, location.lng] : [19.0760, 72.8777];

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-200 bg-slate-950' : 'w-full h-[400px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl'}`}>
      
      {/* Operational Telemetry Map */}
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {ambulances.map(a => (
          <AmbulanceMarker key={a.unitId} ambulance={a} isDispatched={a.unitId === dispatchedUnitId} />
        ))}

        {dispatchedUnit && dispatchedUnit.route.length > 0 && (
          <Polyline 
            positions={dispatchedUnit.route} 
            pathOptions={{ 
              color: '#ef4444', 
              weight: 4, 
              dashArray: '10, 10',
              lineCap: 'round',
              lineJoin: 'round'
            }} 
          />
        )}

        <MapController center={mapCenter} isFull={isFullScreen} />
      </MapContainer>

      {/* Overlays */}
      <div className="absolute top-4 left-4 z-1000 space-y-2 pointer-events-none">
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="bg-red-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto"
            >
              <AlertTriangle size={18} className="animate-pulse" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none opacity-80">Dispatch Alert</p>
                <p className="text-xs font-black uppercase tracking-tight">{notification}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {dispatchedUnit && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 backdrop-blur-xl border border-red-500/30 p-4 rounded-3xl shadow-2xl w-[280px] pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">En Route</span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dispatchedUnit.unitId}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <Clock size={16} className="text-blue-400 mb-1" />
                <p className="text-[8px] uppercase text-slate-500 font-black tracking-widest">ETA</p>
                <p className="text-sm font-black text-white leading-none mt-1">{eta}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <Navigation size={16} className="text-emerald-400 mb-1" />
                <p className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Dist</p>
                <p className="text-sm font-black text-white leading-none mt-1">{distance}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <User size={20} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] uppercase text-slate-500 font-black tracking-widest leading-none">{dispatchedUnit.type} Certified</p>
                <p className="text-[11px] font-black text-white truncate uppercase tracking-tight mt-0.5">{dispatchedUnit.paramedic}</p>
                <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Paramedic En Route</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2">
        <button 
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-xl"
        >
          {isFullScreen ? <X size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Bottom Dispatch Panel (Only if no unit dispatched) */}
      {!dispatchedUnitId && (
        <div className="absolute bottom-6 left-6 right-6 z-1000 flex gap-3 overflow-x-auto pb-4 nexus-scrollbar no-scrollbar">
          {ambulances.map(a => (
            <button
              key={a.unitId}
              onClick={() => handleDispatch(a.unitId)}
              className="shrink-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-4xl w-[200px] hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-2 h-2 rounded-full ${a.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{a.unitId}</span>
                <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">MoRTH SOURCE</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                  <Activity size={20} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white uppercase tracking-tight">{a.type}</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Available</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                Dispatch <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CSS for dashed route animation */}
      <style>{`
        .leaflet-pane .leaflet-polyline-pane path {
          stroke-dasharray: 10, 10;
          animation: dash-move 20s linear infinite;
        }
        @keyframes dash-move {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        .custom-ambulance-icon {
          background: transparent !important;
          border: none !important;
        }
        .tactical-popup .leaflet-popup-content-wrapper {
          background: #020617;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.5rem;
          padding: 0;
        }
        .tactical-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .tactical-popup .leaflet-popup-tip {
          background: #020617;
        }
      `}</style>
    </div>
  );
};
