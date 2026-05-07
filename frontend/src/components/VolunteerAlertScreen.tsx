import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { 
  AlertCircle, 
  MapPin, 
  ShieldAlert,
  ArrowRight,
  X
} from 'lucide-react';
import { useVolunteerStore } from '../store/volunteerStore';

export const VolunteerAlertScreen: React.FC = () => {
  const { nearbyIncidents, removeIncident, updateStats } = useVolunteerStore();
  const [activeAlert, setActiveAlert] = useState<any>(nearbyIncidents[0] || null);

  useEffect(() => {
    // Safely update active alert when incidents change without triggering cascading renders if same
    const firstIncident = nearbyIncidents[0];
    if (firstIncident && (!activeAlert || activeAlert.incidentId !== firstIncident.incidentId)) {
      const timer = setTimeout(() => setActiveAlert(firstIncident), 0);
      return () => clearTimeout(timer);
    } else if (!firstIncident && activeAlert) {
      const timer = setTimeout(() => setActiveAlert(null), 0);
      return () => clearTimeout(timer);
    }
  }, [nearbyIncidents, activeAlert]);

  if (!activeAlert) return null;

  const handleRespond = () => {
    // In a real app, this would open navigation
    alert(`Navigating to ${activeAlert.type} at ${activeAlert.location.lat}, ${activeAlert.location.lng}`);
    updateStats({ points: 50 }); // Reward for responding
    removeIncident(activeAlert.incidentId);
    setActiveAlert(null);
  };

  const handleIgnore = () => {
    removeIncident(activeAlert.incidentId);
    setActiveAlert(null);
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="w-full max-w-sm"
      >
        <Panel className="bg-red-950/40 border-red-500/50 shadow-2xl shadow-red-500/20 overflow-hidden relative">
          {/* Pulsing Background Ring */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="p-6 relative">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-red-500/20 rounded-(--radius-lg)">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <button 
                onClick={handleIgnore}
                title="Dismiss alert"
                className="p-1 text-red-500/50 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-1">NEARBY EMERGENCY</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">Critical</span>
                <span className="text-red-300 text-sm font-medium">{activeAlert.distance}km away from you</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-(--radius-lg) bg-(--nx-bg-(--color-surface)) flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-[10px] text-(--nx-text-tertiary) uppercase font-bold tracking-widest">Location</div>
                  <div className="text-sm text-white font-medium">NH-48 Corridor, Northbound</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-(--radius-lg) bg-(--nx-bg-(--color-surface)) flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-[10px] text-(--nx-text-tertiary) uppercase font-bold tracking-widest">Incident Type</div>
                  <div className="text-sm text-white font-medium">{activeAlert.type}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="danger-outline" 
                className="w-full py-4 border-red-500/30 text-red-400"
                onClick={handleIgnore}
              >
                Decline
              </Button>
              <Button 
                variant="primary" 
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 group"
                onClick={handleRespond}
              >
                Accept
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="bg-red-500 h-1 w-full overflow-hidden">
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 15, ease: "linear" }}
              className="h-full bg-white origin-left"
              onAnimationComplete={handleIgnore}
            />
          </div>
        </Panel>
      </motion.div>
    </div>
  );
};
