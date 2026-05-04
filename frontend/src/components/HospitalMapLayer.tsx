import React from 'react';
import { Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useHospitalStore } from '../store';

// Helper to create custom SVG icons for hospitals
const createHospitalIcon = (color: string) => L.divIcon({
  className: 'custom-hospital-icon',
  html: `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 10px ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">H</div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

interface HospitalMapLayerProps {
  incidentLocation?: { lat: number; lng: number };
}

export const HospitalMapLayer: React.FC<HospitalMapLayerProps> = ({
  incidentLocation = { lat: 28.6139, lng: 77.2090 }
}) => {
  const { hospitals } = useHospitalStore();

  // Sort hospitals to find the top match
  const sortedHospitals = [...hospitals].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  const topHospital = sortedHospitals[0];

  return (
    <>
      {/* Travel Time Rings (Simulated 5m, 10m, 15m at 40km/h) */}
      {/* 40km/h = ~666m/min -> 5m = 3333m, 10m = 6666m, 15m = 10000m */}
      <Circle
        center={[incidentLocation.lat, incidentLocation.lng]}
        radius={3333}
        pathOptions={{ color: 'var(--nx-green-primary)', fillColor: 'transparent', weight: 1, dashArray: '4,4' }}
      />
      <Circle
        center={[incidentLocation.lat, incidentLocation.lng]}
        radius={6666}
        pathOptions={{ color: 'var(--nx-amber-primary)', fillColor: 'transparent', weight: 1, dashArray: '4,4' }}
      />
      <Circle
        center={[incidentLocation.lat, incidentLocation.lng]}
        radius={10000}
        pathOptions={{ color: 'var(--nx-red-primary)', fillColor: 'transparent', weight: 1, dashArray: '4,4' }}
      />

      {/* Route to best hospital */}
      {topHospital && (
        <Polyline
          positions={[
            [incidentLocation.lat, incidentLocation.lng],
            [topHospital.lat, topHospital.lng]
          ]}
          pathOptions={{ 
            color: 'var(--nx-green-primary)', 
            weight: 3, 
            dashArray: topHospital.preAlerted ? undefined : '10,10',
            opacity: 0.8
          }}
        />
      )}

      {/* Hospital Markers */}
      {hospitals.map(h => {
        const capacityRatio = ((h.erTotalBeds - h.erAvailableBeds) / h.erTotalBeds) * 100;
        let color = '#30d158'; // green
        if (capacityRatio > 85) color = '#ff453a'; // red
        else if (capacityRatio > 50) color = '#ff9f0a'; // amber

        // Highlight recommended hospital
        const isTop = h.id === topHospital?.id;
        if (isTop) color = '#30d158'; // Ensure top is visibly green/highlighted

        return (
          <Marker 
            key={h.id} 
            position={[h.lat, h.lng]}
            icon={createHospitalIcon(color)}
          >
            <Popup className="nexus-popup">
              <div className="p-2 min-w-[200px]">
                <div className="text-xs font-bold uppercase tracking-widest text-white mb-1">
                  {h.name} {isTop && <span className="text-[var(--nx-green-primary)]">(RECOMMENDED)</span>}
                </div>
                <div className="text-[10px] text-[var(--nx-text-secondary)] mb-2">
                  Trauma Level {h.traumaLevel}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-black/30 p-1.5 rounded-sm">
                    <span className="text-[var(--nx-text-tertiary)] uppercase block">Beds</span>
                    <span className="text-white font-mono">{h.erAvailableBeds}/{h.erTotalBeds}</span>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded-sm">
                    <span className="text-[var(--nx-text-tertiary)] uppercase block">Wait</span>
                    <span className="text-white font-mono">{h.erWaitMinutes}m</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
