import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, Navigation, Share2, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { useServicesStore } from '../store';

export const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { services } = useServicesStore();
  const service = services[Number(id)] || {
    name: "AIIMS Delhi Trauma Centre",
    type: "hospital",
    phone_primary: "011-26588500",
    address: "Ansari Nagar East, New Delhi, 110029",
    distance: "2.4 km",
    eta: "8 min"
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="h-48 bg-navy relative border-b border-white/10">
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => navigate(-1)} className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="w-full h-full bg-gradient-to-tr from-emergency/20 to-navy opacity-50 flex items-center justify-center">
          <span className="text-6xl">🏥</span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-5 -mt-6 bg-background rounded-t-3xl relative z-20">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-condensed font-bold text-white leading-tight">{service.name}</h1>
          <div className="bg-safe/20 text-safe px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-safe/30">Open</div>
        </div>
        
        <p className="text-muted font-sans text-sm mb-4">{service.address}</p>

        {/* Trust Signals */}
        <div className="flex items-center space-x-4 mb-6 text-sm">
          <div className="flex items-center text-amber-500">
            <Star size={16} className="fill-current mr-1" />
            <span className="font-bold">4.8</span>
          </div>
          <div className="flex items-center text-safe opacity-80">
            <CheckCircle size={14} className="mr-1" />
            <span>Verified 2h ago</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs text-muted font-mono uppercase tracking-widest mb-1">Live Distance</span>
            <span className="text-2xl font-bold font-sans text-white">{service.distance || '2.4 km'}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs text-muted font-mono uppercase tracking-widest mb-1">Drive ETA</span>
            <span className="text-2xl font-bold font-sans text-emergency">{service.eta || '8 min'}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <h3 className="text-xs text-muted font-mono uppercase tracking-widest mb-3">Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {['Level 1 Trauma', '24/7 ICU', 'Blood Bank', 'Burn Unit'].map((badge, i) => (
              <span key={i} className="px-3 py-1.5 bg-navy/80 border border-white/10 rounded-full text-xs font-bold text-gray-300">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.open(`tel:${service.phone_primary}`)}
            className="w-full bg-safe text-navy py-4 rounded-2xl flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(46,196,182,0.4)] hover:bg-teal-400 transition-colors"
          >
            <Phone size={24} className="mr-3" /> CALL NOW
          </button>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-white/10 text-white py-3 rounded-2xl flex items-center justify-center font-bold text-sm hover:bg-white/20">
              <Navigation size={18} className="mr-2" /> Directions
            </button>
            <button className="flex-1 bg-white/10 text-white py-3 rounded-2xl flex items-center justify-center font-bold text-sm hover:bg-white/20">
              <Share2 size={18} className="mr-2" /> Share
            </button>
          </div>
        </div>

        <button className="w-full mt-6 text-xs text-muted flex items-center justify-center hover:text-white transition-colors">
          <AlertTriangle size={12} className="mr-1" /> Report outdated info
        </button>
      </div>
    </div>
  );
};
