import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SOSButton } from '../components/SOSButton';
import { Hospital, Users, Brain, Map as MapIcon } from 'lucide-react';
import { PredictiveRiskEngine } from '../components/PredictiveRiskEngine';

interface HomeProps {
  onSOS: () => void;
  onNavigate: (tab: string) => void;
}

const STATS = [
  "India: 461,312 accidents/year",
  "1 death every 3 minutes",
  "Golden Hour: Your window to save a life"
];

export const Home: React.FC<HomeProps> = ({ onSOS, onNavigate }) => {
  const [statIndex, setStatIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatIndex(prev => (prev + 1) % STATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-night">
      {/* Background Grid */}
      <div className="absolute inset-0 hud-grid animate-grid-drift pointer-events-none" />

      {/* ZONE B - HERO */}
      <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-24 z-10">
        {/* Animated Counter Strip */}
        <div className="h-12 flex items-center justify-center mb-12">
          <AnimatePresence mode="wait">
            <motion.p
              key={statIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-amber-alert text-lg font-bold uppercase tracking-widest text-center px-6"
            >
              {STATS[statIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* SOS BUTTON */}
        <SOSButton onActivate={onSOS} />

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4 w-full px-6 mt-16 max-w-2xl">
          <button onClick={() => onNavigate('map')} className="action-tile">
            <Hospital size={32} className="text-sos-red mb-2" />
            <span className="text-white font-bold">Hospitals</span>
            <span className="text-text-muted text-xs">12 nearby</span>
          </button>
          
          <button onClick={() => onNavigate('bystander')} className="action-tile">
            <Users size={32} className="text-cyan mb-2" />
            <span className="text-white font-bold">Bystander</span>
            <span className="text-text-muted text-xs">I'm a Helper →</span>
          </button>
          
          <button onClick={() => onNavigate('ai')} className="action-tile">
            <Brain size={32} className="text-safe-green mb-2" />
            <span className="text-white font-bold">AI Triage</span>
            <span className="text-text-muted text-xs">Talk to AI</span>
          </button>
          
          <button onClick={() => onNavigate('stats')} className="action-tile">
            <MapIcon size={32} className="text-amber-alert mb-2" />
            <span className="text-white font-bold">Black Spots</span>
            <span className="text-text-muted text-xs">Road heatmap</span>
          </button>
        </div>

        {/* Predictive Risk Engine Section */}
        <div className="w-full px-6 mt-12 mb-12 max-w-2xl">
          <PredictiveRiskEngine />
        </div>
      </div>
    </div>
  );
};
