import React, { useState } from 'react';
import { Shield, MapPin, Navigation, AlertTriangle, Clock, Info, CheckCircle, Search } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherStore } from '../store/weatherStore';
import { useRouteStore } from '../store/routeStore';
import { logger } from '../lib/logger';

interface DangerSegment {
  name: string;
  km: string;
  reason: string;
  accidents2023: number;
}

interface RouteSafetyResult {
  overallScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  dangerSegments: DangerSegment[];
  safestDepartureTime: string;
  avoidanceAdvice: string;
}

// Seed danger segments
const DANGER_SEGMENTS = [
  {
    name: "NH-48 Sector 4",
    km: "342-358 (Chennai-Bangalore)",
    reason: "High-speed heavy vehicle merging & poor lighting",
    accidents2023: 14,
    coords: [[12.9716, 79.1589], [12.8916, 79.3589]] as [number, number][]
  },
  {
    name: "NH-44 Bypass",
    km: "891-904 (Krishnagiri)",
    reason: "Sharp descent with blind turns",
    accidents2023: 9,
    coords: [[12.5283, 78.2144], [12.4283, 78.1144]] as [number, number][]
  },
  {
    name: "NH-66 Fog Zone",
    km: "112-128 (Coastal)",
    reason: "Micro-climate fog with zero visibility",
    accidents2023: 11,
    coords: [[15.4909, 73.8278], [15.5909, 73.9278]] as [number, number][]
  }
];

const MAJOR_CITIES = [
  "Chennai", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Kolkata", 
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Coimbatore", "Madurai",
  "Trichy", "Salem", "Kochi", "Vizag", "Patna", "Indore", "Thane", "Bhopal"
];

// Helper to center map
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export const RouteSafetyAssessment: React.FC = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RouteSafetyResult | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);
  
  const { currentWeather } = useWeatherStore();
  const { startJourney } = useRouteStore();

  const handleAnalyze = async () => {
    if (!source || !destination) return;
    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2000));

    try {
      const response = await fetch('/api/route/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, destination, weather: currentWeather })
      });
      const data = await response.json();
      setResult(data);
      
      // Focus map on first danger segment if exists
      if (data.dangerSegments?.length > 0) {
        setMapCenter([12.9716, 79.1589]);
        setMapZoom(9);
      }
    } catch (err) {
      logger.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-(--clr-red)';
      case 'HIGH': return 'text-orange-500';
      case 'MODERATE': return 'text-(--clr-saffron)';
      default: return 'text-(--clr-green)';
    }
  };

  return (
    <div className="flex flex-col h-full bg-(--clr-bg) text-(--clr-text) overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-(--clr-border) flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--clr-blue)/20 flex items-center justify-center text-(--clr-blue)">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PRE-JOURNEY SAFETY CHECK</h1>
            <p className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest">Powered by AI-Risk Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-(--clr-blue) animate-pulse" />
          <span className="text-[9px] font-mono tracking-widest uppercase">Telemetry Active</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Controls & Analysis */}
        <div className="w-[400px] border-r border-(--clr-border) overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          
          {/* Inputs */}
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-mono text-(--clr-text-2) mb-1.5 block ml-1 uppercase">Source City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-(--clr-text-2)" size={16} />
                <input 
                  type="text" 
                  list="cities"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Starting point..."
                  className="w-full bg-white/5 border border-(--clr-border) rounded-xl py-3 pl-10 pr-4 text-sm focus:border-(--clr-blue) focus:ring-1 focus:ring-(--clr-blue) outline-none transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-mono text-(--clr-text-2) mb-1.5 block ml-1 uppercase">Destination</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-(--clr-text-2)" size={16} />
                <input 
                  type="text" 
                  list="cities"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ending point..."
                  className="w-full bg-white/5 border border-(--clr-border) rounded-xl py-3 pl-10 pr-4 text-sm focus:border-(--clr-blue) focus:ring-1 focus:ring-(--clr-blue) outline-none transition-all"
                />
              </div>
            </div>

            <datalist id="cities">
              {MAJOR_CITIES.map(c => <option key={c} value={c} />)}
            </datalist>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !source || !destination}
              className="w-full h-12 bg-(--clr-blue) hover:bg-(--clr-blue-hover) disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all group overflow-hidden relative"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-mono text-xs uppercase tracking-widest">Analysing...</span>
                </>
              ) : (
                <>
                  <Search size={18} className="group-hover:scale-110 transition-transform" />
                  <span>ANALYSE ROUTE SAFETY</span>
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-12"
              >
                {/* Overall Score */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                      <h3 className="text-xs font-mono text-(--clr-text-2) uppercase">Safety Score</h3>
                      <p className={`text-3xl font-black ${getRiskColor(result.riskLevel)}`}>{result.overallScore}%</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black border ${getRiskColor(result.riskLevel).replace('text-', 'border-')} ${getRiskColor(result.riskLevel).replace('text-', 'bg-')}/10`}>
                      {result.riskLevel} RISK
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.overallScore}%` }}
                      className={`h-full bg-current ${getRiskColor(result.riskLevel)}`}
                    />
                  </div>
                </div>

                {/* Danger Segments */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-mono text-(--clr-text-2) uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={14} className="text-(--clr-red)" />
                    High-Risk Segments
                  </h3>
                  {result.dangerSegments.map((seg: DangerSegment, i: number) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 4 }}
                      className="p-4 bg-(--clr-red)/5 border border-(--clr-red)/20 rounded-xl flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-(--clr-red)/20 flex items-center justify-center text-(--clr-red) shrink-0">
                        {seg.accidents2023}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{seg.name}</h4>
                        <p className="text-[10px] text-(--clr-text-2) font-mono">{seg.km}</p>
                        <p className="text-[11px] mt-1 text-white/70 italic">"{seg.reason}"</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Advice */}
                <div className="p-4 bg-(--clr-blue)/5 border border-(--clr-blue)/20 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-(--clr-blue) mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Optimal Departure</h4>
                      <p className="text-sm text-(--clr-blue) font-bold">{result.safestDepartureTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                    <Info size={16} className="text-(--clr-blue) mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">AI Advice</h4>
                      <p className="text-xs text-white/60 leading-relaxed">{result.avoidanceAdvice}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => startJourney(source, destination, result.overallScore)}
                  className="w-full py-4 bg-white/5 border border-white/10 hover:border-(--clr-blue) hover:bg-(--clr-blue)/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle size={18} />
                  <span>LOG JOURNEY START</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 relative">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Render Danger Segments */}
            {DANGER_SEGMENTS.map((seg, i) => (
              <React.Fragment key={i}>
                <Polyline 
                  positions={seg.coords} 
                  pathOptions={{ color: 'var(--clr-red)', weight: 4, opacity: 0.8, dashArray: '8, 8' }} 
                />
                <CircleMarker 
                  center={seg.coords[0]} 
                  pathOptions={{ color: 'var(--clr-red)', fillColor: 'var(--clr-red)', fillOpacity: 0.5 }}
                  radius={15}
                >
                  <Popup>
                    <div className="font-sans text-black">
                      <h4 className="font-bold">{seg.name}</h4>
                      <p className="text-xs">{seg.accidents2023} accidents in 2023</p>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            ))}

            {/* Custom Overlay Controls */}
            <div className="absolute top-6 right-6 z-1000 flex flex-col gap-2">
              <button 
                title="Current Location"
                className="p-3 bg-(--clr-bg) border border-(--clr-border) rounded-xl shadow-2xl text-(--clr-text-2) hover:text-white"
              >
                <Navigation size={20} />
              </button>
            </div>
          </MapContainer>

          {/* Map Overlay HUD */}
          <div className="absolute bottom-6 left-6 right-6 z-1000 pointer-events-none">
            <div className="p-4 bg-(--clr-bg)/80 backdrop-blur-md border border-(--clr-border) rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-(--clr-text-2) uppercase">Map Engine</span>
                  <span className="text-xs font-bold">VIRTUAL_INDIA_GRID_v4</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-(--clr-text-2) uppercase">Active Hazards</span>
                  <span className="text-xs font-bold text-(--clr-red)">03 IDENTIFIED</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-(--clr-blue) flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-(--clr-blue) animate-ping" />
                SYNC_STATUS: OPERATIONAL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

