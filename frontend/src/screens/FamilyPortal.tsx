import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Navigation, 
  Heart, 
  CheckCircle2, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { logger } from '../lib/logger';

// Mock Leaflet Icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type IncidentPhase = 'DETECTED' | 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED';

export const FamilyPortal: React.FC = () => {
  const { incidentToken } = useParams<{ incidentToken: string }>();
  const [phase] = useState<IncidentPhase>('DISPATCHED');
  const [enRoute, setEnRoute] = useState(false);
  const [eta, setEta] = useState(8);
  const [goldenHour, setGoldenHour] = useState(48);

  const mockLocation: [number, number] = [13.0827, 80.2707]; // Chennai

  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
      setGoldenHour(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleEnRoute = () => {
    setEnRoute(true);
    // In real app, emit socket event here
    logger.log("Emitting familyMember:enRoute for token:", incidentToken);
  };

  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-6 bg-linear-to-b from-black/50 to-transparent flex justify-between items-center relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="text-rose-500" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic">
              ROAD<span className="text-rose-500">SOS</span> FAMILY PORTAL
            </h1>
            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Incident Tracking Mode Active</p>
          </div>
        </div>
        <div className="px-4 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
           Live Connection
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden">
        
        {/* Left: Map Section */}
        <div className="flex-1 rounded-[2rem] overflow-hidden border border-white/10 relative shadow-2xl min-h-[300px]">
          <MapContainer 
            center={mockLocation} 
            zoom={15} 
            style={{ height: '100%', width: '100%', filter: 'grayscale(1) invert(1) contrast(1.2)' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={mockLocation} icon={redIcon} />
            <Circle 
              center={mockLocation} 
              radius={200} 
              pathOptions={{ fillColor: 'red', fillOpacity: 0.1, color: 'red', weight: 1 }} 
            />
          </MapContainer>
          
          {/* Map Controls Overlays */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 z-[1000]">
             <button className="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-xl hover:bg-black/80 transition-all">
                <Navigation size={20} />
             </button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-[1000]">
             <div className="p-4 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                      <MapPin className="text-white" size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Current Incident Location</p>
                      <h3 className="text-sm font-bold text-white uppercase truncate max-w-[200px]">NH-48, km 342, Chennai</h3>
                   </div>
                </div>
                <button className="text-rose-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                   Get Directions <ChevronRight size={14} />
                </button>
             </div>
          </div>
        </div>

        {/* Right: Status Section */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Phase Card */}
          <div className="p-8 rounded-[2.5rem] bg-[#0A0F1A] border border-white/10 flex flex-col">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-8">RESPONSE STATUS</h3>
            
            <div className="space-y-8 relative">
              {/* Timeline Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/5" />
              
              {[
                { id: 'DETECTED', label: 'Incident Detected', desc: 'Auto-SOS payload transmitted', time: '14:22' },
                { id: 'DISPATCHED', label: 'Ambulance Dispatched', desc: 'Unit TN-108-C4 assigned', time: '14:24' },
                { id: 'EN_ROUTE', label: 'Responders En Route', desc: 'ETA synchronized with traffic', time: '14:25' },
                { id: 'ARRIVED', label: 'Arrived at Scene', desc: 'Emergency personnel on site', time: '--:--' }
              ].map((s) => {
                const isCompleted = ['DETECTED', 'DISPATCHED', 'EN_ROUTE'].indexOf(phase) >= ['DETECTED', 'DISPATCHED', 'EN_ROUTE'].indexOf(s.id);
                
                return (
                  <div key={s.id} className="flex gap-6 items-start relative">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                      isCompleted ? 'bg-rose-500 border-rose-500' : 'bg-black border-white/10'
                    }`}>
                      {isCompleted && <CheckCircle2 className="text-white" size={14} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-white/20'}`}>{s.label}</h4>
                        <span className="text-[9px] font-mono text-white/20">{s.time}</span>
                      </div>
                      <p className={`text-[10px] mt-1 ${isCompleted ? 'text-white/40' : 'text-white/5'}`}>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Countdown Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-rose-500/20 to-rose-500/5 flex items-center justify-center border border-rose-500/20 mb-3">
                 <Clock className="text-rose-500" size={20} />
              </div>
              <span className="text-[24px] font-black text-white">{eta}m</span>
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest mt-1">Ambulance ETA</span>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/20 mb-3">
                 <Heart className="text-amber-500" size={20} />
              </div>
              <span className="text-[24px] font-black text-white">{goldenHour}m</span>
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest mt-1">Golden Hour</span>
            </div>
          </div>

          {/* User Interaction */}
          <div className="p-8 rounded-[2.5rem] bg-linear-to-br from-[#2979FF]/20 to-[#2979FF]/5 border border-[#2979FF]/20 flex flex-col items-center text-center">
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">ARE YOU HEADING TO THE SCENE?</h4>
            <p className="text-[10px] text-white/60 mb-6 leading-relaxed uppercase font-mono tracking-tighter">
               Inform the responders of your arrival to facilitate coordination.
            </p>
            
            <AnimatePresence mode="wait">
              {!enRoute ? (
                <Button 
                  key="btn"
                  variant="primary" 
                  className="w-full h-12 rounded-2xl gap-2 font-black tracking-widest text-[10px] uppercase shadow-[0_0_20px_rgba(41,121,255,0.3)]"
                  onClick={handleEnRoute}
                >
                  <Navigation size={16} /> I AM ON MY WAY
                </Button>
              ) : (
                <motion.div 
                  key="status"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-3 px-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-2 text-green-500"
                >
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Responders Notified</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button className="mt-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
               <MessageSquare size={14} /> Contact Incident Commander
            </button>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <footer className="p-4 bg-black/40 border-t border-white/5 flex justify-center items-center gap-8">
         <div className="flex items-center gap-2 text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            End-to-End Encrypted
         </div>
         <div className="flex items-center gap-2 text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            256-bit AES Compliance
         </div>
      </footer>
    </div>
  );
};

export default FamilyPortal;
