import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Phone, Hospital as HospitalIcon, Clock, Navigation, Globe } from 'lucide-react';

interface MedicalService {
  id: string;
  name: string;
  type: 'Hospital' | 'Trauma' | 'Clinic';
  distance: number;
  lat: number;
  lng: number;
  phone?: string;
  wait?: number;
  isNHAIAffiliated?: boolean;
}

const services: MedicalService[] = [
  { id: '1', name: 'Apollo Trauma Centre', type: 'Trauma', distance: 0.8, lat: 28.5355, lng: 77.2639, phone: '1066', isNHAIAffiliated: true },
  { id: '2', name: 'Max Super Speciality', type: 'Hospital', distance: 1.2, lat: 28.5276, lng: 77.2111, phone: '011-26515050', wait: 12 },
  { id: '3', name: 'AIIMS Emergency', type: 'Trauma', distance: 2.5, lat: 28.5672, lng: 77.2100, phone: '011-26588500', wait: 45, isNHAIAffiliated: true },
  { id: '4', name: 'Fortis Escorts', type: 'Hospital', distance: 3.1, lat: 28.5606, lng: 77.2732, phone: '011-47135000', wait: 20 }
];

export const HospitalFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<MedicalService | null>(null);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoute = (s: MedicalService) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`, '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col bg-night p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Medical Response</h2>
          <p className="text-[10px] font-black text-cyan uppercase tracking-widest flex items-center gap-2">
            <Globe size={10} /> Global Satellite Triage Active
          </p>
        </div>
        <div className="flex bg-night-2 rounded-2xl p-1 border border-white/5">
          <button className="px-4 py-2 bg-cyan text-night rounded-xl text-xs font-black uppercase" title="Show Nearby Facilities">Nearby</button>
          <button className="px-4 py-2 text-white/40 text-xs font-black uppercase" title="Call Air Ambulance">Air-Ambulance</button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text"
          placeholder="Search Trauma Centers, Hospitals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-night-2 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-cyan transition-colors"
          title="Search Hospitals"
        />
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* List */}
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {filteredServices.map(s => (
            <motion.div
              key={s.id}
              onClick={() => setSelectedService(s)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-4xl flex items-center gap-4 transition-all border-2 cursor-pointer ${
                selectedService?.id === s.id ? 'border-cyan bg-cyan/5' : 'border-white/5 bg-night-2 hover:border-white/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                s.type === 'Hospital' ? 'bg-sos-red/10 text-(--color-emergency)' : 'bg-cyan/10 text-cyan'
              }`}>
                <HospitalIcon size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold truncate uppercase tracking-tight">{s.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-cyan text-[10px] font-black uppercase tracking-widest">{s.type}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">NEARBY</span>
                </div>
                
                {s.type === 'Hospital' && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(100 - (s.wait || 0) * 2, 5)}%` }}
                        className={`h-full ${s.wait! < 15 ? 'bg-(--color-safe)' : s.wait! < 30 ? 'bg-(--color-warning)' : 'bg-(--color-emergency)'}`}
                      />
                    </div>
                    <p className="text-[9px] font-bold text-text-muted mt-2 uppercase tracking-widest flex justify-between">
                      <span>Wait time: {s.wait} min</span>
                      <span className={s.wait! < 15 ? 'text-(--color-safe)-green' : s.wait! < 30 ? 'text-(--color-warning)' : 'text-(--color-emergency)'}>
                        {s.wait! < 15 ? 'Optimal' : s.wait! < 30 ? 'Elevated' : 'Critical'}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {selectedService?.id === s.id && (
                <button 
                  onClick={() => s.phone && (window.location.href = `tel:${s.phone}`)}
                  title={`Call ${s.name}`}
                  aria-label={`Call ${s.name}`}
                  className="w-12 h-12 bg-(--color-safe) text-night rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                >
                  <Phone size={20} strokeWidth={3} />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Details Card */}
        <AnimatePresence mode="wait">
          {selectedService ? (
            <motion.div
              key={selectedService.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-night-2 border border-white/5 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 blur-[100px] pointer-events-none" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-cyan/10 text-cyan rounded-(--radius-lg) text-[10px] font-black uppercase tracking-widest">
                      {selectedService.type}
                    </span>
                    {selectedService.isNHAIAffiliated && (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-(--radius-lg) text-[10px] font-black uppercase tracking-widest">
                        NHAI Affiliated
                      </span>
                    )}
                  </div>
                  <h3 className="text-4xl font-black text-white leading-none uppercase tracking-tighter">
                    {selectedService.name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Distance</p>
                  <p className="text-2xl font-black text-white">{selectedService.distance} KM</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">ETA</p>
                  <p className="text-2xl font-black text-cyan">{Math.ceil(selectedService.distance * 2.5)} MIN</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => handleRoute(selectedService)}
                  className="w-full py-5 bg-white text-night rounded-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  title="Start Navigation"
                >
                  <Navigation size={20} /> Start Navigation
                </button>
                <button 
                  onClick={() => selectedService.phone && (window.location.href = `tel:${selectedService.phone}`)}
                  className="w-full py-5 border-2 border-white/10 text-white rounded-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
                  title="Direct Emergency Line"
                >
                  <Phone size={20} /> Direct Emergency Line
                </button>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-text-muted" />
                  <p className="text-xs text-text-muted font-medium">
                    Operating 24/7 • Dedicated Trauma Bay Available
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-[2.5rem]">
              <MapPin className="text-white/10 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white/20 uppercase tracking-widest">Select a facility to view details</h3>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
