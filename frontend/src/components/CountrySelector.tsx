import React, { useState, useMemo } from 'react';
import { Search, X, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import emergencyData from '../data/emergency-numbers.json';
import { useUserStore } from '../store';

interface CountrySelectorProps {
  onClose: () => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ onClose }) => {
  const { countryCode, setCountryCode } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');

  const countries = useMemo(() => {
    return Object.entries(emergencyData).map(([code, data]) => ({
      code,
      name: data.name,
      flag: data.flag
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const lowerQuery = searchQuery.toLowerCase();
    return countries.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.code.toLowerCase().includes(lowerQuery)
    );
  }, [countries, searchQuery]);

  const handleSelect = (code: string) => {
    setCountryCode(code);
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
    setTimeout(onClose, 200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-150 flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl h-full max-h-[800px] bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Globe size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Global Jurisdiction</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Emergency Protocol Territory</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            title="Close Territory Selector"
            aria-label="Close territory selector modal"
            className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="SEARCH COUNTRY OR REGION..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all uppercase tracking-wider text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 nexus-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredCountries.map((country) => {
              const isSelected = country.code === countryCode;
              return (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                    isSelected 
                    ? 'bg-blue-600/20 border-blue-500/50 text-white' 
                    : 'bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="text-left">
                      <p className={`font-black uppercase tracking-tight ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                        {country.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        CODE: {country.code}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={18} className="text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
          
          {filteredCountries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Globe size={48} className="opacity-20 mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">No Territories Found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Cache Synchronized</span>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">v2.4.0-Jurisdiction</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
