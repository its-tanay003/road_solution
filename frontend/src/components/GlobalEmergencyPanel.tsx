import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, 
  Shield, 
  Flame, 
  Ambulance, 
  MapPin, 
  RefreshCw,
  PhoneCall,
  ChevronDown,
  Search
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
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        setIsDetecting(true);
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code && EMERGENCY_NUMBERS[data.country_code]) {
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
    <div className="flex flex-col h-full bg-(--app-bg) text-(--app-text) font-sans overflow-hidden">
      {/* Header */}
      <div className="p-8 bg-(--app-surface) border-b-4 border-(--app-border) space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">WORLD SOS</h1>
            <div className="flex items-center gap-2">
              {isDetecting ? (
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                  <RefreshCw size={14} className="animate-spin" />
                  Locating...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-safe">
                  <MapPin size={14} />
                  GPS ACTIVE: {currentNumbers.name}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="h-16 px-6 bg-(--app-bg) border-4 border-(--app-border) rounded-2xl flex items-center gap-4 text-2xl"
          >
            <span className="text-3xl">{currentNumbers.flag}</span>
            <ChevronDown size={28} className={showSelector ? 'rotate-180' : ''} />
          </button>
        </div>

        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 pt-4"
            >
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" size={24} />
                <input 
                  type="text"
                  placeholder="SEARCH COUNTRY..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-20 bg-(--app-bg) border-4 border-(--app-border) rounded-3xl pl-16 pr-6 text-xl font-black uppercase focus:border-navy transition-all"
                />
              </div>
              
              <div className="max-h-80 overflow-y-auto grid grid-cols-1 gap-3 pr-2 custom-scrollbar">
                {filteredCountries.map(([code, country]) => (
                  <button
                    key={code}
                    onClick={() => {
                      setSelectedCountry(code);
                      setShowSelector(false);
                    }}
                    className={`flex items-center justify-between p-6 rounded-3xl border-4 transition-all text-left ${
                      selectedCountry === code 
                      ? 'bg-navy text-white border-navy' 
                      : 'bg-(--app-bg) border-(--app-border)'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-4xl">{country.flag}</span>
                      <span className="text-2xl font-black uppercase italic tracking-tighter">{country.name}</span>
                    </div>
                    <span className="text-lg font-mono opacity-50">{country.emergency}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main SOS Panel */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
        <button
          onClick={() => callService(currentNumbers.emergency)}
          className="w-full h-56 bg-emergency text-white rounded-[3rem] flex flex-col items-center justify-center gap-4 shadow-2xl active:scale-95 transition-transform relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <PhoneCall size={120} />
          </div>
          <span className="text-5xl font-black tracking-tighter italic uppercase leading-none">DIAL {currentNumbers.emergency}</span>
          <span className="text-xl font-black uppercase tracking-[0.3em] opacity-80">Universal Emergency</span>
        </button>

        <div className="grid grid-cols-1 gap-6">
          <ServiceRow 
            label="POLICE" 
            number={currentNumbers.police} 
            icon={Shield} 
            color="bg-navy" 
            onClick={() => callService(currentNumbers.police)} 
          />
          <ServiceRow 
            label="AMBULANCE" 
            number={currentNumbers.ambulance} 
            icon={Ambulance} 
            color="bg-safe" 
            onClick={() => callService(currentNumbers.ambulance)} 
          />
          <ServiceRow 
            label="FIRE" 
            number={currentNumbers.fire} 
            icon={Flame} 
            color="bg-amber" 
            onClick={() => callService(currentNumbers.fire)} 
          />
        </div>

        {/* Extended Services */}
        <div className="space-y-4">
          <h3 className="text-sm font-black opacity-40 uppercase tracking-widest px-2">Extended Local Help</h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(currentNumbers).map(([key, value]) => {
              if (['name', 'flag', 'ambulance', 'police', 'fire', 'emergency'].includes(key)) return null;
              return (
                <button
                  key={key}
                  onClick={() => callService(value)}
                  className="bg-(--app-surface) border-4 border-(--app-border) rounded-4xl p-6 flex items-center justify-between active:scale-95 transition-transform"
                >
                  <div>
                    <span className="block text-xs font-black opacity-40 uppercase tracking-widest">{key.replace('_', ' ')}</span>
                    <span className="block text-2xl font-black text-(--app-text) italic">{value}</span>
                  </div>
                  <div className="w-16 h-16 bg-navy/10 rounded-2xl flex items-center justify-center">
                    <Phone size={32} className="text-navy" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ServiceRowProps {
  label: string;
  number: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

const ServiceRow: React.FC<ServiceRowProps> = ({ label, number, icon: Icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full h-32 bg-(--app-surface) border-4 border-(--app-border) rounded-[2.5rem] p-8 flex items-center justify-between active:scale-95 transition-transform group shadow-lg"
  >
    <div className="flex items-center gap-8">
      <div className={`w-20 h-20 ${color} rounded-3xl flex items-center justify-center text-white shadow-lg`}>
        <Icon size={40} strokeWidth={3} />
      </div>
      <div className="text-left">
        <span className="block text-sm font-black opacity-40 uppercase tracking-widest">{label}</span>
        <span className="block text-4xl font-black italic tracking-tighter text-(--app-text)">{number}</span>
      </div>
    </div>
    <div className="w-16 h-16 bg-(--app-bg) border-4 border-(--app-border) rounded-full flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-colors">
      <PhoneCall size={28} />
    </div>
  </button>
);
