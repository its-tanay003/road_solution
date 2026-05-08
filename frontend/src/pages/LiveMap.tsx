import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
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

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100vh',
};

// Tactical dark map style
const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

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

export const LiveMap = () => {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries: ['places']
  });

  const { lat, lng, loading: locLoading } = useUserLocation();
  const { searchRadius } = useMapDataStore();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);

  // useNearbyPlaces relies on user location and the map instance (for the Places service)
  const { places } = useNearbyPlaces(lat, lng, map);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const center = useMemo(() => ({ lat: lat || 13.0827, lng: lng || 80.2707 }), [lat, lng]);

  const handlePlaceSelected = (placeResult: google.maps.places.PlaceResult) => {
    if (placeResult.geometry?.location && map) {
      map.panTo(placeResult.geometry.location);
      map.setZoom(15);
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#080C14] text-white p-6 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Map Load Error</h2>
        <p className="text-sm text-white/70">Please check your Google Maps API Key configuration.</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#080C14]">
      {/* Tactical Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_3px)] z-[5]" />

      {/* Top Header/Action Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent z-[40] pointer-events-none flex justify-between p-4 items-start">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors pointer-events-auto shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="h-10 px-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-black tracking-widest pointer-events-auto shadow-lg shadow-red-600/30">
          SOS
        </button>
      </div>

      <EmergencyMapMode />
      <SearchBar onPlaceSelected={handlePlaceSelected} />
      <LayerTogglePanel />
      <RadiusControl />

      {(!isLoaded || locLoading) ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm font-mono tracking-widest uppercase">Initializing SAT-LINK...</p>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={MAP_OPTIONS}
        >
          {/* User Location Marker */}
          {lat && lng && (
            <>
              <Marker
                position={{ lat, lng }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
                zIndex={100}
              />
              <Circle
                center={{ lat, lng }}
                radius={searchRadius}
                options={{
                  strokeColor: '#3b82f6',
                  strokeOpacity: 0.2,
                  strokeWeight: 1,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.05,
                  clickable: false
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
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => setSelectedPlace(place)}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: color,
                  fillOpacity: 0.9,
                  strokeColor: '#ffffff',
                  strokeWeight: 1,
                }}
              />
            );
          })}
        </GoogleMap>
      )}

      {/* Bottom Sheets */}
      <ServiceBottomSheet 
        places={places} 
        onPlaceClick={(place) => setSelectedPlace(place)} 
      />
      <ServiceDetailSheet 
        place={selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
      />

    </div>
  );
};
