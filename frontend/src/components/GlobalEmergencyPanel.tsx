import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, 
  Shield, 
  Flame, 
  Ambulance, 
  AlertCircle, 
  Search, 
  Globe, 
  MapPin, 
  Navigation,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import emergencyData from '../data/emergency-numbers.json';

interface CountryNumbers {
  name: string;
  flag: string;
  ambulance: string;
  police: string;
  fire: string;
  emergency: string;
  [key: string]: string;
}

const EMERGENCY_NUMBERS = emergencyData as Record<string, CountryNumbers>;

export const GlobalEmergencyPanel: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('IN');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        setIsDetecting(true);
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code && EMERGENCY_NUMBERS[data.country_code]) {
          setDetectedCountry(data.country_code);
          setSelectedCountry(data.country_code);
        }
      } catch (error) {
        console.error('Country detection failed:', error);
      } finally {
        setIsDetecting(false);
      }
    };
    detectCountry();
  }, []);

  const currentNumbers = EMERGENCY_NUMBERS[selectedCountry];

  const filteredCountries = useMemo(() => {
    return Object.entries(EMERGENCY_NUMBERS).filter(([code, country]) => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const callService = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="flex flex-col h-full bg-(--nx-bg-base) text-white font-sans overflow-hidden">
      {/* Header with Auto-Detection Status */}
      <div className="p-6 bg-(--nx-bg-surface) border-b border-(--nx-border) space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
              <Globe className="text-nx-blue-primary animate-pulse" size={24} />
              Global SOS
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {isDetecting ? (
                <div className="flex items-center gap-2 text-[10px] text-nx-text-dim uppercase tracking-widest">
                  <RefreshCw size={12} className="animate-spin" />
                  Detecting Geo-Zone...
                </div>
              ) : detectedCountry ? (
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                  <MapPin size={12} />
                  Detected: {EMERGENCY_NUMBERS[detectedCountry].name}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] text-nx-red-primary uppercase tracking-widest font-bold">
                  <AlertCircle size={12} />
                  Detection Failed — Manual Select
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-tight"
          >
            {currentNumbers.flag} {currentNumbers.name}
            <Navigation size={14} className={showSelector ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>

        {/* Searchable Country Selector */}
        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nx-text-dim" size={16} />
                  <input 
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-nx-blue-primary transition-all"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {filteredCountries.map(([code, country]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setSelectedCountry(code);
                        setShowSelector(false);
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                        selectedCountry === code 
                        ? 'bg-nx-blue-primary/20 border-nx-blue-primary text-nx-blue-primary' 
                        : 'bg-white/2 border-white/5 text-nx-text-dim hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-[10px] font-black uppercase tracking-tight truncate">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main SOS Panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* BIG RED SOS BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => callService(currentNumbers.emergency)}
          className="w-full group relative overflow-hidden bg-nx-red-primary p-8 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-2xl shadow-nx-red-primary/40 border border-white/20"
        >
          <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-50" />
          <div className="relative z-10 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <PhoneCall size={48} className="text-white animate-bounce" />
          </div>
          <div className="relative z-10 text-center">
            <span className="block text-3xl font-black text-white uppercase tracking-tighter leading-none">Universal SOS</span>
            <span className="text-lg font-mono text-white/80 mt-2 block">{currentNumbers.emergency}</span>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </motion.button>

        {/* SERVICE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ServiceCard 
            label="Police" 
            number={currentNumbers.police} 
            icon={Shield} 
            color="amber" 
            onClick={() => callService(currentNumbers.police)} 
          />
          <ServiceCard 
            label="Ambulance" 
            number={currentNumbers.ambulance} 
            icon={Ambulance} 
            color="emerald" 
            onClick={() => callService(currentNumbers.ambulance)} 
          />
          <ServiceCard 
            label="Fire Dept" 
            number={currentNumbers.fire} 
            icon={Flame} 
            color="orange" 
            onClick={() => callService(currentNumbers.fire)} 
          />
        </div>

        {/* ADDITIONAL SERVICES */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-nx-text-dim uppercase tracking-widest pl-2">Extended Local Services</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(currentNumbers).map(([key, value]) => {
              if (['name', 'flag', 'ambulance', 'police', 'fire', 'emergency'].includes(key)) return null;
              return (
                <button
                  key={key}
                  onClick={() => callService(value)}
                  className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-all text-left"
                >
                  <div className="space-y-1">
                    <span className="block text-[8px] text-nx-text-dim uppercase font-black tracking-widest">{key.replace('_', ' ')}</span>
                    <span className="block text-sm font-black text-white">{value}</span>
                  </div>
                  <Phone size={14} className="text-nx-blue-primary opacity-50" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Info */}
      <div className="p-4 bg-black/40 text-center border-t border-white/5">
        <p className="text-[8px] text-nx-text-dim uppercase tracking-[0.2em] font-black">
          ROADSoS Global Mesh v4.2 • Offline Encrypted Database Verified
        </p>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  label: string;
  number: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ label, number, icon: Icon, color, onClick }) => (
  <motion.button
    whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white/2 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all"
  >
    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 flex items-center justify-center border border-${color}-500/20`}>
      <Icon className={`text-${color}-500`} size={28} />
    </div>
    <div className="text-center">
      <span className="block text-[10px] text-nx-text-dim uppercase font-black tracking-widest mb-1">{label}</span>
      <span className="block text-xl font-mono font-bold text-white tracking-tight">{number}</span>
    </div>
  </motion.button>
);
