import React, { useEffect, useRef } from 'react';
import L from 'leaflet';


import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React/Vite
const defaultIconProto = L.Icon.Default.prototype as { _getIconUrl?: string };
delete defaultIconProto._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Service { 
  id: string; 
  name: string; 
  type: string; 
  lat: number; 
  lng: number; 
  phone?: string; 
}

interface Props { 
  services: Service[]; 
  userLat: number; 
  userLng: number; 
  incidentLat?: number; 
  incidentLng?: number; 
  showRiskHeatmap?: boolean;
  showBlackSpots?: boolean;
  route?: [number, number][];
  drones?: { id: string, lat: number, lng: number }[];
}

// Mock data for black spots (ported from IndiaBlackSpots.tsx)
const BLACK_SPOTS = [
  { id: 'NH44-1', name: 'NH44 - Kurnool Junction', lat: 15.8281, lng: 78.0373, severity: 'HIGH' },
  { id: 'NH48-1', name: 'NH48 - Mumbai-Pune Expressway Curve', lat: 18.7515, lng: 73.4050, severity: 'CRITICAL' },
  { id: 'NH19-1', name: 'NH19 - Agra-Kanpur Highway stretch', lat: 26.4499, lng: 80.3319, severity: 'HIGH' },
  { id: 'DELHI-1', name: 'Delhi - Mukarba Chowk', lat: 28.7373, lng: 77.1643, severity: 'CRITICAL' }
];

import { AlertTriangle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

export function LiveMap({ services, userLat, userLng, incidentLat, incidentLng, showRiskHeatmap, showBlackSpots, route, drones }: Props): React.ReactElement {
  const { connected } = useSocket();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroup = useRef<L.LayerGroup | null>(null);
  const riskLayer = useRef<L.LayerGroup | null>(null);
  const blackSpotsLayer = useRef<L.LayerGroup | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);
  const droneLayer = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [userLat, userLng],
      zoom: 14,
      zoomControl: false,
    });
    mapInstance.current = map;

    // Dark Mode Tiles (CARTO)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors, © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Reposition Zoom Control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer groups
    layerGroup.current = L.layerGroup().addTo(map);
    riskLayer.current = L.layerGroup().addTo(map);
    blackSpotsLayer.current = L.layerGroup().addTo(map);
    routeLayer.current = L.layerGroup().addTo(map);
    droneLayer.current = L.layerGroup().addTo(map);

    // Static User Location Marker
    L.circleMarker([userLat, userLng], {
      radius: 8,
      color: '#0A84FF',
      fillColor: '#0A84FF',
      fillOpacity: 1,
      weight: 2,
    }).addTo(map).bindPopup('You are here');

    // ... (rest of the init remains the same)

    // Static Accuracy Circle
    L.circle([userLat, userLng], {
      radius: 80,
      color: '#0A84FF',
      fillColor: '#0A84FF',
      fillOpacity: 0.15,
      weight: 1,
    }).addTo(map);

    // Animated Radar Effect (SVG Overlay)
    const radarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" class="radar-svg">
      <circle cx="150" cy="150" r="60" fill="none" stroke="#32D74B" stroke-width="0.5"/>
      <circle cx="150" cy="150" r="110" fill="none" stroke="#32D74B" stroke-width="0.5"/>
      <line x1="150" y1="150" x2="260" y2="150" stroke="#32D74B" stroke-width="1.5">
        <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="4s" repeatCount="indefinite"/>
      </line>
    </svg>`;

    const radarIcon = L.divIcon({
      className: '',
      html: radarSvg,
      iconSize: [300, 300],
      iconAnchor: [150, 150]
    });

    L.marker([userLat, userLng], { 
      icon: radarIcon, 
      interactive: false,
      zIndexOffset: -1000 
    }).addTo(map);

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [userLat, userLng]); // Added dependencies to fix lint

  // Update Risk Heatmap & Black Spots
  useEffect(() => {
    if (!mapInstance.current || !riskLayer.current || !blackSpotsLayer.current) return;

    // Handle Risk Heatmap
    riskLayer.current.clearLayers();
    if (showRiskHeatmap) {
      // Mock heatpoints
      const heatpoints = [
        { lat: userLat + 0.005, lng: userLng + 0.005, intensity: 0.8 },
        { lat: userLat - 0.003, lng: userLng + 0.008, intensity: 0.5 },
        { lat: userLat + 0.01, lng: userLng - 0.002, intensity: 0.9 },
      ];
      heatpoints.forEach(p => {
        L.circle([p.lat, p.lng], {
          radius: 400 * p.intensity,
          color: 'transparent',
          fillColor: '#FF3B3B',
          fillOpacity: p.intensity * 0.4,
        }).addTo(riskLayer.current!);
      });
    }

    // Handle Black Spots
    blackSpotsLayer.current.clearLayers();
    if (showBlackSpots) {
      BLACK_SPOTS.forEach(spot => {
        L.circle([spot.lat, spot.lng], {
          radius: 2000,
          color: spot.severity === 'CRITICAL' ? '#FF3B3B' : '#FF9F0A',
          fillColor: spot.severity === 'CRITICAL' ? '#FF3B3B' : '#FF9F0A',
          fillOpacity: 0.2,
          weight: 2,
          dashArray: '5, 5'
        }).addTo(blackSpotsLayer.current!).bindPopup(`<b>${spot.name}</b><br>${spot.severity} RISK ZONE`);
      });
    }
  }, [showRiskHeatmap, showBlackSpots, userLat, userLng]);

  // Update markers when services or incident location changes
  useEffect(() => {
    if (!mapInstance.current || !layerGroup.current) return;

    // Clear previous dynamic markers
    layerGroup.current.clearLayers();

    // Service Icons & Markers
    const iconColors: Record<string, string> = {
      Hospital: '#FF3B3B',
      Police: '#0A84FF',
      'Fire Station': '#FF9F0A',
      Ambulance: '#32D74B',
      'Tyre/Puncture Shop': '#BF5AF2',
      'Car Mechanic': '#5AC8FA',
      'Petrol Pump': '#EF9F27',
      'Other': '#888780',
    };

    services.forEach(s => {
      const color = iconColors[s.type] || iconColors.Other;
      const svgIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:${color}">${s.type[0]}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      
      L.marker([s.lat, s.lng], { icon: svgIcon })
        .addTo(layerGroup.current!)
        .bindPopup(`<b>${s.name}</b><br>${s.type}${s.phone ? `<br><a href="tel:${s.phone}">${s.phone}</a>` : ''}`);
    });

    if (incidentLat && incidentLng) {
      const incidentIcon = L.divIcon({
        className: 'incident-icon',
        html: `<div><span>!</span></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      L.marker([incidentLat, incidentLng], { icon: incidentIcon })
        .addTo(layerGroup.current!)
        .bindPopup('Active Incident');
    }
  }, [services, incidentLat, incidentLng]);

  // Update Route & Drones
  useEffect(() => {
    if (!mapInstance.current || !routeLayer.current || !droneLayer.current) return;

    routeLayer.current.clearLayers();
    if (route && route.length > 0) {
      L.polyline(route, {
        color: '#0A84FF',
        weight: 5,
        opacity: 0.6,
        dashArray: '10, 10',
      }).addTo(routeLayer.current);
    }

    droneLayer.current.clearLayers();
    if (drones) {
      drones.forEach(drone => {
        const droneIcon = L.divIcon({
          className: 'drone-icon',
          html: `<div style="width:24px;height:24px;background:#32D74B;border-radius:4px;border:2px solid white;transform:rotate(45deg);box-shadow:0 0 10px rgba(50,215,75,0.5)"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([drone.lat, drone.lng], { icon: droneIcon })
          .addTo(droneLayer.current!)
          .bindPopup(`Drone ${drone.id}`);
      });
    }
  }, [route, drones]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {!connected && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 backdrop-blur-md text-black px-4 py-1.5 rounded-full flex items-center gap-2 border border-amber-600 shadow-xl pointer-events-none">
          <AlertTriangle size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Real-time updates paused — showing last known data</span>
        </div>
      )}
      <div 
        ref={mapRef} 
        id="live-emergency-map"
        role="application"
        aria-label="Live Emergency Services Map"
        className="w-full h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden map-container" 
      />
      
      {/* HUD Overlays */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0A84FF] animate-pulse" />
          <span className="text-[10px] font-mono text-white/80 uppercase tracking-wider">GPS System: Active</span>
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#32D74B]" />
          <span className="text-[10px] font-mono text-white/80 uppercase tracking-wider">Radar Scanning</span>
        </div>
      </div>

      <style>{`
        .map-container { background: #080C14; }
        .radar-svg { opacity: 0.12; pointer-events: none; }
        .custom-div-icon div {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          font-size: 12px;
          color: white;
          font-weight: 500;
        }
        .incident-icon div {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #FF3B3B;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(255,59,59,0.6);
        }
        .incident-icon span {
          color: white;
          font-size: 18px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
