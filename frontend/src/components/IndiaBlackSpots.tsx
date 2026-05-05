import { useEffect, useState } from 'react';
import { Circle, Popup } from 'react-leaflet';
import { useSosStore } from '../store';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for top 15 black spots on Indian National Highways
const BLACK_SPOTS = [
  { id: 'NH44-1', name: 'NH44 - Kurnool Junction', lat: 15.8281, lng: 78.0373, severity: 'HIGH' },
  { id: 'NH48-1', name: 'NH48 - Mumbai-Pune Expressway Curve', lat: 18.7515, lng: 73.4050, severity: 'CRITICAL' },
  { id: 'NH19-1', name: 'NH19 - Agra-Kanpur Highway stretch', lat: 26.4499, lng: 80.3319, severity: 'HIGH' },
  { id: 'NH44-2', name: 'NH44 - Anantapur Highway crossing', lat: 14.6819, lng: 77.6006, severity: 'HIGH' },
  { id: 'NH48-2', name: 'NH48 - Vapi-Valsad Segment', lat: 20.3893, lng: 72.9106, severity: 'CRITICAL' },
  { id: 'NH65-1', name: 'NH65 - Pune-Solapur Highway', lat: 18.1841, lng: 74.6108, severity: 'HIGH' },
  { id: 'NH66-1', name: 'NH66 - Ratnagiri Coastal Road curve', lat: 16.9902, lng: 73.3002, severity: 'HIGH' },
  { id: 'NH16-1', name: 'NH16 - Visakhapatnam Anandapuram Junction', lat: 17.8205, lng: 83.3421, severity: 'CRITICAL' },
  { id: 'NH44-3', name: 'NH44 - Hosur-Krishnagiri Stretch', lat: 12.5186, lng: 78.2137, severity: 'CRITICAL' },
  { id: 'NH48-3', name: 'NH48 - Tumkur Road Junction', lat: 13.0734, lng: 77.4990, severity: 'HIGH' },
  { id: 'NH27-1', name: 'NH27 - Rajkot-Morbi Highway', lat: 22.3039, lng: 70.8022, severity: 'HIGH' },
  { id: 'NH52-1', name: 'NH52 - Jaipur-Sikar Highway', lat: 27.6094, lng: 75.1398, severity: 'CRITICAL' },
  { id: 'NH16-2', name: 'NH16 - Bhubaneswar-Cuttack Highway', lat: 20.2961, lng: 85.8245, severity: 'HIGH' },
  { id: 'NH66-2', name: 'NH66 - Udupi-Mangalore Highway', lat: 13.3409, lng: 74.7421, severity: 'HIGH' },
  { id: 'NH44-4', name: 'NH44 - Salem-Madurai Highway', lat: 11.6643, lng: 78.1460, severity: 'CRITICAL' },
  // Delhi fallback just for testing if user is in Delhi
  { id: 'DELHI-1', name: 'Delhi - Mukarba Chowk', lat: 28.7373, lng: 77.1643, severity: 'CRITICAL' }
];

// Helper to calculate distance in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export const IndiaBlackSpots = () => {
  const { location } = useSosStore();
  const [warningSpot, setWarningSpot] = useState<{name: string} | null>(null);

  useEffect(() => {
    if (location) {
      let foundWarning = null;
      for (const spot of BLACK_SPOTS) {
        const dist = getDistanceFromLatLonInKm(location.lat, location.lng, spot.lat, spot.lng);
        if (dist <= 2.0) {
          foundWarning = spot;
          break;
        }
      }
      setWarningSpot(foundWarning);
    }
  }, [location]);

  return (
    <>
      {/* Toast Notification for UI Warning */}
      <AnimatePresence>
        {warningSpot && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="pointer-events-auto"
            >
              <div className="bg-red-500/90 backdrop-blur-md border border-red-400 p-4 rounded-xl shadow-2xl flex items-start gap-3 max-w-md w-full">
                <AlertTriangle className="text-white shrink-0 animate-pulse" size={24} />
                <div>
                  <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">High-Risk Zone Approaching</h4>
                  <p className="text-red-100 font-mono text-[10px] leading-tight">
                    You are within 2km of {warningSpot.name}. This is an iRAD-identified accident black spot. Proceed with extreme caution.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leaflet Overlays */}
      {BLACK_SPOTS.map(spot => (
        <Circle
          key={spot.id}
          center={[spot.lat, spot.lng]}
          radius={2000} // 2km radius
          pathOptions={{
            color: spot.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
            fillColor: spot.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
            fillOpacity: 0.2,
            weight: 2,
            dashArray: '5, 5'
          }}
        >
          <Popup className="font-sans">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-2 border ${
                spot.severity === 'CRITICAL' 
                  ? 'border-red-500/50 text-red-500 bg-red-500/10' 
                  : 'border-amber-500/50 text-amber-500 bg-amber-500/10'
              }`}>
                {spot.severity} RISK
              </div>
              <h3 className="font-bold text-white mb-1 leading-tight">{spot.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono">iRAD Identified Black Spot</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
};
