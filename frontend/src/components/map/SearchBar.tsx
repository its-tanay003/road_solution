import { useState } from 'react';
import { Search, Mic, Building2, Car, Shield, Activity, Fuel } from 'lucide-react';
import { useMapDataStore } from '../../store/mapDataStore';
import type { ServiceLayerType } from '../../store/mapDataStore';
import { Autocomplete } from '@react-google-maps/api';

const QUICK_FILTERS = [
  { id: 'hospitals', label: 'Hospital', icon: Building2 },
  { id: 'ambulances', label: 'Ambulance', icon: Car },
  { id: 'police', label: 'Police', icon: Shield },
  { id: 'pharmacies', label: 'Pharmacy', icon: Activity },
  { id: 'fuel', label: 'Fuel', icon: Fuel },
];

interface SearchBarProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
}

export const SearchBar = ({ onPlaceSelected }: SearchBarProps) => {
  const { activeLayers, toggleLayer } = useMapDataStore();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autoC: google.maps.places.Autocomplete) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        onPlaceSelected(place);
      }
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 flex flex-col gap-2">
      {/* Search Input Container */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center shadow-2xl">
        <button className="p-2 text-white/70 hover:text-white transition-colors">
          <Search size={20} />
        </button>
        
        <div className="flex-1 mx-2">
          {window.google && window.google.maps ? (
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
              <input
                type="text"
                placeholder="Search hospitals, police, clinics..."
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/50 text-sm font-medium"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              placeholder="Search (Requires Google Maps)"
              disabled
              className="w-full bg-transparent border-none outline-none text-white/50 placeholder:text-white/30 text-sm font-medium"
            />
          )}
        </div>

        <button 
          className="p-2 text-white/70 hover:text-white transition-colors"
          onClick={() => {
            // Web Speech API stub
            alert('Voice search requires HTTPS and microphone permissions.');
          }}
        >
          <Mic size={20} />
        </button>
      </div>

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
