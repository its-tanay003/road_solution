import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useMapDataStore } from '../store/mapDataStore';
import type { MapPlace } from '../store/mapDataStore';
import { useUserLocation } from '../hooks/useUserLocation';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';

import { SearchBar } from '../components/map/SearchBar';
import { LayerTogglePanel } from '../components/map/LayerTogglePanel';
import { RadiusControl } from '../components/map/RadiusControl';
import { ServiceBottomSheet } from '../components/map/ServiceBottomSheet';
import { ServiceDetailSheet } from '../components/map/ServiceDetailSheet';
import { EmergencyMapMode } from '../components/map/EmergencyMapMode';
import { useRoadReportStore } from '../store/roadReportStore';
import { RoadReportSheet } from '../components/RoadReportSheet';
import { AlertTriangle } from 'lucide-react';

// Marker Colors mapping
const MARKER_COLORS: Record<string, string> = {
  hospitals: '#ef4444',
  clinics: '#ec4899',
  pharmacies: '#22c55e',
  bloodBanks: '#dc2626',
  ambulances: '#f97316',
  police: '#3b82f6',
  fire: '#ef4444',
  fuel: '#eab308',
  tolls: '#a855f7',
  atms: '#9ca3af',
  blackSpots: '#ef4444',
  hazards: '#f97316'
};

// Custom Marker Creator
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Map Controller for panning and zooming
const MapController = ({ center, zoom }: { center: [number, number], zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

export const LiveMap = () => {
  const navigate = useNavigate();
  const { lat, lng, loading: locLoading } = useUserLocation();
  const { searchRadius } = useMapDataStore();
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const initialLockRef = useRef(false);
  const [mapZoom, setMapZoom] = useState(14);

  const { setReporting } = useRoadReportStore();
  const { places, fetchNearby } = useNearbyPlaces();

  // Set initial center once location is available
  useEffect(() => {
    if (lat && lng && !initialLockRef.current) {
      setMapCenter([lat, lng]);
      initialLockRef.current = true;
    }
  }, [lat, lng]);

  // Fetch nearby places when location or radius changes
  useEffect(() => {
    if (lat && lng) {
      fetchNearby(lat, lng, searchRadius);
    }
  }, [lat, lng, searchRadius, fetchNearby]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(16);
  };

  const centerPosition = useMemo(() => {
    if (lat && lng) return [lat, lng] as [number, number];
    return [13.0827, 80.2707] as [number, number]; // Chennai fallback
  }, [lat, lng]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-base">
      {/* Tactical Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_3px)] z-400" />

      {/* Top Header/Action Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-black/80 to-transparent z-500 pointer-events-none flex justify-between p-4 items-start">
        <button 
          onClick={() => navigate('/')}
          aria-label="Go Back"
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors pointer-events-auto shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="h-10 px-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-black tracking-widest pointer-events-auto shadow-lg shadow-red-600/30">
          SOS
        </button>
      </div>

      <EmergencyMapMode />
      <SearchBar onLocationSelect={handleLocationSelect} />
      <LayerTogglePanel />
      <RadiusControl />

      {locLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#050A14]">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm font-mono tracking-widest uppercase">Initializing SAT-LINK...</p>
        </div>
      ) : (
        <MapContainer
          center={centerPosition}
          zoom={14}
          zoomControl={false}
          style={{ width: '100%', height: '100vh' }}
          className="z-10"
        >
          <MapController center={mapCenter || centerPosition} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* User Location Marker & Search Radius */}
          {lat && lng && (
            <>
              <Marker position={[lat, lng]} icon={userIcon} zIndexOffset={1000} />
              <Circle 
                center={[lat, lng]} 
                radius={searchRadius}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 1,
                  opacity: 0.2,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.05
                }}
              />
            </>
          )}

          {/* Place Markers */}
          {places.map((place) => {
            const color = MARKER_COLORS[place.type] || '#ffffff';
            return (
              <Marker
                key={place.id}
                position={[place.lat, place.lng]}
                icon={createMarkerIcon(color)}
                eventHandlers={{
                  click: () => setSelectedPlace(place as unknown as MapPlace),
                }}
              />
            );
          })}
        </MapContainer>
      )}

      {/* Bottom Sheets */}
      <ServiceBottomSheet 
        places={places as unknown as MapPlace[]} 
        onPlaceClick={(place) => {
          setSelectedPlace(place);
          setMapCenter([place.lat, place.lng]);
          setMapZoom(17);
        }} 
      />
      
      <ServiceDetailSheet 
        place={selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
      />

      {/* Feature 2: Road Condition Reporting */}
      <RoadReportSheet />
      
      <div className="absolute bottom-[240px] right-4 z-30">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setReporting(true)}
          className="w-16 h-16 bg-orange-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl shadow-orange-600/20 border border-white/20 pointer-events-auto"
        >
          <AlertTriangle size={24} />
          <span className="text-[10px] font-black uppercase mt-1">Report</span>
        </motion.button>
      </div>
    </div>
  );
};
