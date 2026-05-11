import React, { useEffect, useState, useRef } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useDroneStore } from '../store/droneStore';

const DRONE_SVG = `
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" stroke="#3B82F6" stroke-width="2" stroke-dasharray="4 4" />
  <path d="M12 12L28 28M28 12L12 28" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="4" fill="#3B82F6" />
  <circle cx="12" cy="12" r="3" fill="#10B981">
    <animate attributeName="opacity" values="1;0.2;1" dur="0.2s" repeatCount="indefinite" />
  </circle>
  <circle cx="28" cy="12" r="3" fill="#10B981">
    <animate attributeName="opacity" values="1;0.2;1" dur="0.2s" repeatCount="indefinite" />
  </circle>
  <circle cx="12" cy="28" r="3" fill="#10B981">
    <animate attributeName="opacity" values="1;0.2;1" dur="0.2s" repeatCount="indefinite" />
  </circle>
  <circle cx="28" cy="28" r="3" fill="#10B981">
    <animate attributeName="opacity" values="1;0.2;1" dur="0.2s" repeatCount="indefinite" />
  </circle>
</svg>
`;

const droneIcon = L.divIcon({
  html: DRONE_SVG,
  className: 'drone-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const START_POS: [number, number] = [13.0125, 80.2214];

export const DroneMapMarker: React.FC<{ target: [number, number] }> = ({ target }) => {
  const { status, isDispatched } = useDroneStore();
  const [pos, setPos] = useState<[number, number]>(START_POS);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isDispatched || status === 'IDLE' || status === 'TAKEOFF') return;

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const progress = (time - startTimeRef.current) / 95000; // Match store timing

      if (progress < 1) {
        // Simple linear interpolation for simulation
        const lat = START_POS[0] + (target[0] - START_POS[0]) * progress;
        const lng = START_POS[1] + (target[1] - START_POS[1]) * progress;
        setPos([lat, lng]);
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setPos(target);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDispatched, status, target]);

  if (!isDispatched) return null;

  return (
    <>
      <Marker position={pos} icon={droneIcon}>
        <Popup className="drone-popup">
          <div className="p-2 font-ui">
            <h4 className="text-xs font-black uppercase text-(--clr-blue)">DR-1 Operational</h4>
            <p className="text-[10px] text-white/60">DRONE RECON FEED — AI scene analysis active.</p>
          </div>
        </Popup>
      </Marker>
      {status === 'HOVERING' || status === 'LIVE' ? (
        <Circle 
          center={pos} 
          radius={200} 
          pathOptions={{ 
            color: '#3B82F6', 
            fillColor: '#3B82F6', 
            fillOpacity: 0.1,
            dashArray: '5, 5'
          }} 
        />
      ) : null}
    </>
  );
};
