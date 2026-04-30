import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useServicesStore, useSosStore } from '../store';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0Q3MjYzOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJNOCAxMWg4djJoLTh6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTExIDhoMnY4aC0yeiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const policeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzE2MjEzRSI+PHBhdGggZD0iTTEyIDJMMyA2djZjMCA1LjU1IDMuODQgMTAuNzQgOSAxMmM1LjE2LTEuMjYgOS02LjQ1IDktMTJWNmwtdy00eiIgZmlsbD0iIzFiODVmZiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzJFQzRCNiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJNOCAxMWh2Mmg4di0yaC04eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMSA4aDJ2OGgtMnoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const MapView = ({ showRiskHeatmap = false }: { showRiskHeatmap?: boolean }) => {
  const { location } = useSosStore();
  const { services } = useServicesStore();
  const [heatpoints, setHeatpoints] = useState<{lat: number, lng: number, intensity: number}[]>([]);
  
  const defaultCenter: [number, number] = location ? [location.lat, location.lng] : [28.6139, 77.2090]; // Delhi default

  useEffect(() => {
    if (showRiskHeatmap) {
      // Fetch simulated heatmap from backend
      fetch(`/api/risk/heatmap?minLat=${defaultCenter[0]-0.1}&maxLat=${defaultCenter[0]+0.1}&minLng=${defaultCenter[1]-0.1}&maxLng=${defaultCenter[1]+0.1}`)
        .then(res => res.json())
        .then(data => {
          if (data.points) setHeatpoints(data.points);
        })
        .catch(err => console.error('Failed to load risk heatmap', err));
    }
  }, [showRiskHeatmap, defaultCenter[0], defaultCenter[1]]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'hospital': return hospitalIcon;
      case 'police': return policeIcon;
      case 'ambulance': return ambulanceIcon;
      default: return new L.Icon.Default();
    }
  };

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden relative z-0 border border-gray-800 shadow-xl">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={defaultCenter} />

        {/* Heatmap Overlay */}
        {showRiskHeatmap && heatpoints.map((point, i) => (
          <Circle 
            key={`heat-${i}`}
            center={[point.lat, point.lng]}
            radius={800 * point.intensity} // Dynamic radius based on risk intensity
            pathOptions={{ 
              color: 'transparent',
              fillColor: '#ef4444', 
              fillOpacity: point.intensity * 0.6 
            }}
          />
        ))}
        
        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {services.map((service, idx) => (
          <Marker 
            key={idx} 
            position={[service.lat, service.lng]} 
            icon={getIcon(service.type)}
          >
            <Popup className="font-sans">
              <strong>{service.name}</strong><br/>
              {service.type.toUpperCase()}<br/>
              <a href={`tel:${service.phone_primary}`} className="text-emergency font-bold">
                {service.phone_primary}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style>{`
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: rgba(22, 33, 62, 0.8) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #F8F9FA !important;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .leaflet-popup-content {
          font-family: 'DM Sans', sans-serif;
          margin: 14px 16px;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #6C757D;
        }
      `}</style>
    </div>
  );
};
