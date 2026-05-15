import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, 
  Truck, 
  Wrench, 
  Stethoscope, 
  ShieldAlert, 
  Flame, 
  MapPin, 
  MessageCircle, 
  Share2,
  Clock,
  Navigation,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSosStore, useUserStore } from '../store';
import { saveRecentCall, getRecentCalls, getCachedServices, type RecentCall, type OfflineService } from '../lib/offlineDB';
import { CountrySelector } from './CountrySelector';

interface EmergencyButtonProps {
  label: string;
  number: string;
  icon: React.ElementType;
  variant: 'critical' | 'vehicle' | 'support';
  lastCalled?: number;
  currentTime: number;
  onClick?: () => void;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ 
  label, 
  number, 
  icon: Icon, 
  variant, 
  lastCalled,
  currentTime,
  onClick 
}) => {
  const bgColor = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
    vehicle: 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20',
    support: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
  }[variant];

  const handleCall = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([100]);
    }
    saveRecentCall(label, number);
    if (onClick) {
      onClick();
    } else {
      window.location.href = `tel:${number}` as string;
    }
  };

  const timeAgo = (ts: number) => {
    const mins = Math.floor((currentTime - ts) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins/60)}h ago`;
  };

  return (
    <div className="relative group">
      <button 
        onClick={handleCall}
        title={`Call ${label}: ${number}`}
        className={`w-full min-h-[72px] p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${bgColor}`}
      >
        {/* @ts-ignore */}
        <Icon size={24} className="group-hover:scale-110 transition-transform" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
          <span className="text-sm font-black tracking-tighter">{number}</span>
        </div>
      </button>
      {lastCalled && (
        <span className="absolute -bottom-5 left-0 right-0 text-center text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
          Last: {timeAgo(lastCalled)}
        </span>
      )}
    </div>
  );
};


export const OneTabEmergencyCall: React.FC = () => {
  const { location } = useSosStore();
  const { activeCountry } = useUserStore();
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [activeResolution, setActiveResolution] = useState<{ type: string; services: OfflineService[] } | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const numbers = useMemo(() => ({
    name: activeCountry.name,
    flag: activeCountry.flag,
    ambulance: activeCountry.emergencyNumbers.ambulance,
    police: activeCountry.emergencyNumbers.police,
    fire: activeCountry.emergencyNumbers.fire,
    emergency: activeCountry.emergencyNumbers.main,
    highway: activeCountry.emergencyNumbers.highway || '112'
  }), [activeCountry]);

  const { isOnHighway, highwayName } = useMemo(() => {
    if (!location) return { isOnHighway: false, highwayName: '' };
    
    if (activeCountry.code === 'IN') {
      const onHighway = location.lat > 28.3 && location.lat < 28.6 && location.lng > 76.9 && location.lng < 77.2;
      return { 
        isOnHighway: onHighway, 
        highwayName: onHighway ? 'NH-48 (Delhi-Mumbai Expressway)' : '' 
      };
    } else if (activeCountry.code === 'US') {
      const onHighway = location.lat > 38.8 && location.lat < 39.0 && location.lng > -77.1 && location.lng < -76.9;
      return { 
        isOnHighway: onHighway, 
        highwayName: onHighway ? 'I-95 (East Coast Corridor)' : '' 
      };
    }
    
    return { isOnHighway: false, highwayName: '' };
  }, [location, activeCountry.code]);

  useEffect(() => {
    const loadCalls = async () => {
      const calls = await getRecentCalls();
      setRecentCalls(calls.sort((a, b) => b.timestamp - a.timestamp));
    };
    loadCalls();
    
    const interval = setInterval(() => {
      loadCalls();
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getLastCalled = (label: string) => {
    return recentCalls.find(c => c.label === label)?.timestamp;
  };

  const resolveServices = async (type: string) => {
    if (!location) return;
    const services = await getCachedServices(location.lat, location.lng, 15);
    const filtered = services.filter(s => s.type.toLowerCase().includes(type.toLowerCase())).slice(0, 3);
    setActiveResolution({ type, services: filtered });
  };

  const shareContacts = () => {
    const text = `EMERGENCY CONTACTS NEAR ME:\n` + 
      `Ambulance: ${numbers.ambulance}\n` +
      `Police: ${numbers.police}\n` +
      `Location: https://www.google.com/maps?q=${location?.lat},${location?.lng}`;
    
    if (navigator.share) {
      navigator.share({ title: 'ROADSoS Emergency Contacts', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Contacts copied to clipboard');
    }
  };

  const whatsappSos = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `🚨 EMERGENCY: I have been in a road accident.\n\n` +
      `My Location: https://www.google.com/maps?q=${location?.lat},${location?.lng}\n` +
      `Coordinates: ${location?.lat.toFixed(6)}, ${location?.lng.toFixed(6)}\n\n` +
      `Sent via ROADSoS Nexus Alpha`
    )}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full bg-slate-950/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-2xl overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-red-500/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Phone size={20} className="text-red-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Tactical Quick-Dial</h2>
            <button 
              onClick={() => setShowCountrySelector(true)}
              className="flex items-center gap-2 group/territory hover:opacity-80 transition-all"
            >
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/territory:text-blue-400 transition-colors">
                {numbers.flag} {numbers.name} Protocol
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Link</span>
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={whatsappSos} 
            title="Share SOS via WhatsApp"
            className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl transition-all shadow-lg shadow-emerald-500/5"
          >
            <MessageCircle size={20} />
          </button>
          <button 
            onClick={shareContacts} 
            title="Share Emergency Contacts"
            className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-2xl transition-all"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Highway Alert */}
      {isOnHighway && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Info size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Highway Detected</p>
              <p className="text-sm font-bold text-white leading-none">{highwayName}</p>
            </div>
          </div>
          <a href={`tel:${numbers.highway}`} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-tighter shadow-lg shadow-amber-500/20">
            <Phone size={14} />
            Call {numbers.highway}
          </a>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8 pb-4">
        <EmergencyButton 
          label="Ambulance" 
          number={numbers.ambulance} 
          icon={Stethoscope} 
          variant="critical" 
          currentTime={currentTime}
          lastCalled={getLastCalled('Ambulance')}
        />
        <EmergencyButton 
          label="Police" 
          number={numbers.police} 
          icon={ShieldAlert} 
          variant="critical" 
          currentTime={currentTime}
          lastCalled={getLastCalled('Police')}
        />
        <EmergencyButton 
          label="Fire" 
          number={numbers.fire} 
          icon={Flame} 
          variant="critical" 
          currentTime={currentTime}
          lastCalled={getLastCalled('Fire')}
        />
        <EmergencyButton 
          label="Emergency" 
          number={numbers.emergency} 
          icon={Phone} 
          variant="critical" 
          currentTime={currentTime}
          lastCalled={getLastCalled('Emergency')}
        />

        <EmergencyButton 
          label="Towing" 
          number="Resolve..." 
          icon={Truck} 
          variant="vehicle" 
          currentTime={currentTime}
          onClick={() => resolveServices('towing')}
          lastCalled={getLastCalled('Towing')}
        />
        <EmergencyButton 
          label="Puncture" 
          number="Resolve..." 
          icon={MapPin} 
          variant="vehicle" 
          currentTime={currentTime}
          onClick={() => resolveServices('tyres')}
          lastCalled={getLastCalled('Puncture')}
        />
        <EmergencyButton 
          label="Mechanic" 
          number="Resolve..." 
          icon={Wrench} 
          variant="vehicle" 
          currentTime={currentTime}
          onClick={() => resolveServices('repair')}
          lastCalled={getLastCalled('Mechanic')}
        />
        <EmergencyButton 
          label="Highway" 
          number={numbers.highway} 
          icon={Navigation} 
          variant="support" 
          currentTime={currentTime}
          lastCalled={getLastCalled('Highway')}
        />
      </div>

      {/* Smart Resolution Modal */}
      <AnimatePresence>
        {activeResolution && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Nearest {activeResolution.type} Services</h3>
              <button 
                onClick={() => setActiveResolution(null)} 
                title="Close Resolution"
                className="text-slate-500 hover:text-white p-2"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {activeResolution.services.length > 0 ? (
                activeResolution.services.map((s) => (
                  <div key={s.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate uppercase tracking-tight">{s.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-blue-400 font-mono">{(s.distance || 0).toFixed(1)} km</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">~{Math.ceil((s.distance || 0) * 3)}m Arrival</span>
                      </div>
                      {s.savedAt && (
                        <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">
                          Cached {Math.floor((currentTime - s.savedAt)/3600000)}h ago
                        </p>
                      )}
                    </div>
                    <a 
                      href={`tel:${s.phone || '108'}`} 
                      className="px-6 py-2.5 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-tighter shadow-lg shadow-blue-500/20 flex items-center gap-2"
                      onClick={() => saveRecentCall(activeResolution.type.toUpperCase(), s.phone || '108')}
                    >
                      Call <ChevronRight size={14} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
                  <Truck size={48} className="opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest text-center">No cached services in range.<br/>Check secondary helplines.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent History Mini-Indicator */}
      {recentCalls.length > 0 && (
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <Clock size={12} />
            Recent Activity
          </div>
          <div className="flex gap-1">
            {recentCalls.slice(0, 3).map((call, i) => (
              <div key={i} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                {call.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country Selector Modal */}
      <AnimatePresence>
        {showCountrySelector && (
          <CountrySelector onClose={() => setShowCountrySelector(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
