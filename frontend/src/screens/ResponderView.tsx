import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Activity, 
  MapPin, 
  AlertCircle, 
  ChevronRight,
  Shield,
  Navigation as NavIcon,
  CheckCircle2
} from 'lucide-react';
import { 
  useSosStore, 
  useAmbulanceStore, 
  useAccessibilityStore,
} from '../store';
import { GoldenHourTimer } from '../components/GoldenHourTimer';
import { DroneVideoFeed } from '../components/DroneVideoFeed';
import { ARIntroCard } from '../components/ARIntroCard';
import { LiveMap as LiveMapComponent } from '../components/LiveMap';
import { logger } from '../lib/logger';

const ResponderView: React.FC = () => {
  const { unitId } = useParams();
  const { location: incidentLoc } = useSosStore();
  const { ambulances } = useAmbulanceStore();
  const { isHighContrast } = useAccessibilityStore();
  const [arrived, setArrived] = useState(false);
  const [showVitals, setShowVitals] = useState(false);

  const unit = ambulances.find(a => a.unitId.includes(unitId || ''));
  const currentPos: [number, number] = unit ? [unit.currentLat, unit.currentLng] : [12.9716, 77.5946];
  const targetPos: [number, number] = incidentLoc ? [incidentLoc.lat, incidentLoc.lng] : [12.9725, 77.5955];

  const handleArrived = () => {
    setArrived(true);
    // In a real app, this would emit a socket event
    logger.log(`Responder ${unitId} arrived on scene`);
  };

  const triageData = {
    summary: "Male, approx 30s. Unresponsive but breathing. Significant impact to chest and lower limbs. Potential internal bleeding.",
    injuries: [
      { label: "Spinal Alert", color: "bg-red-500" },
      { label: "Lower Fracture", color: "bg-orange-500" },
      { label: "Tachypnea", color: "bg-yellow-500" }
    ],
    vitals: {
      hr: "112 BPM",
      bp: "90/60",
      spo2: "92%",
      gcs: "8/15"
    }
  };

  return (
    <div className={`fixed inset-0 bg-[#080C14] text-white flex flex-col font-sans overflow-hidden ${isHighContrast ? 'contrast-125' : ''}`}>
      {/* Top Strip */}
      <div className="bg-[#121826] border-b border-white/10 p-4 flex justify-between items-center z-50">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Incident ID</p>
          <code className="text-xl font-mono text-amber-400">INC-2026-4421</code>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-full flex items-center gap-2">
            <Activity size={16} className="text-red-500 animate-pulse" />
            <span className="font-black text-xl">O-</span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative">
        <LiveMapComponent 
          userLat={currentPos[0]}
          userLng={currentPos[1]}
          incidentLat={targetPos[0]}
          incidentLng={targetPos[1]}
          services={[]}
          route={[currentPos, targetPos]}
          drones={[{ id: 'D-01', lat: targetPos[0], lng: targetPos[1] }]}
        />

        {/* Floating ETA */}
        {!arrived && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-blue-600 px-6 py-3 rounded-2xl shadow-2xl z-40 border border-white/20"
          >
            <p className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">ETA TO SCENE</p>
            <p className="text-3xl font-mono font-black">6 MIN</p>
          </motion.div>
        )}

        {/* Golden Hour Mini */}
        <div className="absolute top-4 left-4 scale-50 origin-top-left z-40 bg-[#080C14]/80 p-2 rounded-full backdrop-blur-md">
          <GoldenHourTimer />
        </div>
      </div>

      {/* Bottom Panel */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        className="bg-[#121826] rounded-t-3xl border-t border-white/10 p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        <AnimatePresence mode="wait">
          {arrived ? (
            <motion.div 
              key="post-arrival"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 text-green-400">
                <CheckCircle2 size={32} />
                <h2 className="text-3xl font-black italic uppercase">On Scene</h2>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Shield size={20} className="text-blue-400" />
                    Patient Vitals
                  </h3>
                  <button 
                    onClick={() => setShowVitals(!showVitals)}
                    className="text-blue-400 font-bold text-sm"
                  >
                    {showVitals ? 'Hide' : 'Show Details'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(triageData.vitals).map(([key, val]) => (
                    <div key={key} className="bg-[#080C14] p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] uppercase text-gray-500 font-bold">{key}</p>
                      <p className="text-2xl font-mono font-black text-white">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                  <Activity size={24} />
                  TRIAGE LOG
                </button>
                <button className="bg-gray-700 h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                  <NavIcon size={24} />
                  HOSPITAL
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="pre-arrival"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* AI Triage Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle size={20} />
                  <span className="font-black tracking-tighter uppercase">AI Triage Alert</span>
                </div>
                <p className="text-xl leading-snug font-medium text-gray-200">
                  {triageData.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {triageData.injuries.map(injury => (
                    <span key={injury.label} className={`${injury.color} px-4 py-2 rounded-full text-sm font-black uppercase tracking-tight`}>
                      {injury.label}
                    </span>
                  ))}
                </div>

                <DroneVideoFeed />
                <ARIntroCard incidentId={unitId || "default"} />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <a 
                  href="tel:112"
                  className="flex-1 bg-white/5 h-20 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1 active:bg-white/10 transition-colors"
                >
                  <Phone size={24} className="text-green-500" />
                  <span className="text-[10px] font-black uppercase">Call 112</span>
                </a>
                <button className="flex-1 bg-white/5 h-20 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1">
                  <MapPin size={24} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase">Navigate</span>
                </button>
              </div>

              <button 
                onClick={handleArrived}
                className="w-full h-24 bg-green-600 rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.3)] flex items-center justify-center gap-4 active:scale-95 transition-transform group"
              >
                <span className="text-4xl font-black italic uppercase tracking-tighter group-active:translate-x-2 transition-transform">Arrived On Scene</span>
                <ChevronRight size={40} className="animate-bounce-x" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default ResponderView;
