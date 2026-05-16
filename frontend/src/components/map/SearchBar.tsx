import { useState, useRef } from 'react';
import { Search, Mic, Building2, Car, Shield, Activity, Fuel, X, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapDataStore } from '../../store/mapDataStore';
import type { ServiceLayerType } from '../../store/mapDataStore';
import { useDebounce } from '../../hooks/useDebounce';

const QUICK_FILTERS = [
  { id: 'hospitals', label: 'Hospital', icon: Building2 },
  { id: 'ambulances', label: 'Ambulance', icon: Car },
  { id: 'police', label: 'Police', icon: Shield },
  { id: 'pharmacies', label: 'Pharmacy', icon: Activity },
  { id: 'fuel', label: 'Fuel', icon: Fuel },
];

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface SearchBarProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
}

export const SearchBar = ({ onLocationSelect }: SearchBarProps) => {
  const { activeLayers, toggleLayer } = useMapDataStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}&countrycodes=in&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
    debouncedSearch(value);
  };

  const handleSelect = (result: NominatimResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    setQuery(result.display_name.split(',')[0]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 flex flex-col gap-2">
      {/* Search Input Container */}
      <div className="bg-[#0D121F]/80 backdrop-blur-xl border border-white/20 rounded-2xl p-1 flex items-center shadow-2xl relative">
        <div className="p-2 text-white/40">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Search size={20} />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          placeholder="Search hospitals, police, clinics..."
          title="Search"
          aria-label="Search"
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm font-medium py-2"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="p-2 text-white/40 hover:text-white transition-colors"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}

        <button 
          className="p-2 text-white/40 hover:text-white transition-colors border-l border-white/10 ml-1"
          onClick={() => alert('Voice search requires HTTPS and microphone permissions.')}
          title="Voice search"
          aria-label="Voice search"
        >
          <Mic size={18} />
        </button>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#0D121F]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="max-h-[300px] overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <MapPin className="w-4 h-4 text-white/40 mt-1 group-hover:text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {result.display_name.split(',')[0]}
                    </p>
                    <p className="text-white/40 text-xs truncate">
                      {result.display_name.split(',').slice(1).join(',').trim()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {QUICK_FILTERS.map(filter => {
          const isActive = activeLayers.has(filter.id as ServiceLayerType);
          return (
            <button
              key={filter.id}
              onClick={() => toggleLayer(filter.id as ServiceLayerType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-md border border-white/5'
              }`}
            >
              <filter.icon size={12} />
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
