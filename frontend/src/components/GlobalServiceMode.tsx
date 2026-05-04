import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  Phone, 
  Languages, 
  Zap,
  Navigation2,
  CheckCircle2
} from 'lucide-react';
import { useUserStore, useSosStore, useServicesStore } from '../store';
import { COUNTRY_PROFILES } from '../data/countries';
import { useTranslation } from 'react-i18next';

export const GlobalServiceMode: React.FC = () => {
  const { activeCountry, switchCountry } = useUserStore();
  const { setLocation } = useSosStore();
  const { setServices } = useServicesStore();
  const { i18n } = useTranslation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySwitch = (code: string) => {
    const profile = COUNTRY_PROFILES[code];
    if (!profile) return;

    // 1. Switch State
    switchCountry(code);

    // 2. Map FlyTo (via location update in store)
    setLocation(profile.capitalCoords[0], profile.capitalCoords[1]);

    // 3. Language Switch
    i18n.changeLanguage(profile.language);

    // 4. Demo Mode: Load mock services for the new capital
    const mockServices = [
      {
        id: `hosp-${code}-1`,
        name: `${profile.capital} General Hospital`,
        type: 'Hospital',
        lat: profile.capitalCoords[0] + 0.01,
        lng: profile.capitalCoords[1] + 0.01,
        phone_primary: profile.emergencyNumbers.ambulance,
        address: `Main St, ${profile.capital}`,
        distance: 1.2,
        eta: '4m'
      },
      {
        id: `pol-${code}-1`,
        name: `${profile.capital} Central Police`,
        type: 'Police',
        lat: profile.capitalCoords[0] - 0.005,
        lng: profile.capitalCoords[1] + 0.015,
        phone_primary: profile.emergencyNumbers.police,
        address: `Police HQ, ${profile.capital}`,
        distance: 0.8,
        eta: '3m'
      }
    ];
    setServices(mockServices);

    // 5. Feedback
    setShowToast(`Switched to ${profile.name} — Local protocols active`);
    setIsOpen(false);
    setSearchQuery('');

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }

    setTimeout(() => setShowToast(null), 3000);
  };

  const filteredCountries = Object.values(COUNTRY_PROFILES).filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative z-1001" ref={dropdownRef}>
      {/* Top Bar Switcher */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/5 transition-all group"
      >
        <span className="text-xl">{activeCountry.flag}</span>
        <div className="text-left hidden md:block">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Mode</p>
          <p className="text-xs font-black text-white uppercase tracking-tight">{activeCountry.name}</p>
        </div>
        <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 w-[320px] bg-slate-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search regions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto nexus-scrollbar p-2">
              {filteredCountries.map(country => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySwitch(country.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${activeCountry.code === country.code ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="text-left">
                      <p className="text-sm font-black text-white uppercase">{country.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Phone size={10} className="text-slate-500" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Emergency: {country.emergencyNumbers.main}</p>
                      </div>
                    </div>
                  </div>
                  {activeCountry.code === country.code && (
                    <CheckCircle2 size={16} className="text-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Driving Side Indicator */}
            <div className="p-4 bg-white/5 flex items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-2">
                <Navigation2 size={14} className={`text-orange-500 ${activeCountry.drivingSide === 'left' ? '-rotate-90' : 'rotate-90'}`} />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Traffic Rule</p>
                  <p className="text-[10px] font-bold text-white uppercase">{activeCountry.drivingSide}-Hand Drive</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Languages size={14} className="text-blue-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Language</p>
                  <p className="text-[10px] font-bold text-white uppercase">{activeCountry.language === 'en' ? 'English' : activeCountry.language.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-2000 flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl shadow-2xl"
          >
            <Zap size={20} className="animate-pulse" />
            <p className="text-sm font-black uppercase tracking-tight">{showToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nexus-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .nexus-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .nexus-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
