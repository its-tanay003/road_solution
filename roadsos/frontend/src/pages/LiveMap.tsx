import { useState } from 'react';
import { MapView } from '../components/MapView';
import { motion } from 'framer-motion';
import { Search, Filter, Phone, Navigation } from 'lucide-react';
import { useServicesStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const LiveMap = () => {
  const { services } = useServicesStore();
  const [sheetState, setSheetState] = useState<'peek' | 'half' | 'full'>('peek');
  const navigate = useNavigate();

  const getSheetY = () => {
    switch (sheetState) {
      case 'peek': return '85%';
      case 'half': return '50%';
      case 'full': return '10%';
      default: return '85%';
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Full Bleed Map */}
      <div className="absolute inset-0">
        <MapView />
      </div>

      {/* Top Floating Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col gap-2">
        <div className="bg-navy/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center shadow-lg">
          <Search className="text-muted ml-2" size={20} />
          <input 
            type="text" 
            placeholder="Search emergency services..." 
            className="bg-transparent border-none outline-none text-card flex-1 ml-3 font-sans placeholder-gray-500"
          />
          <button className="p-2 bg-white/5 rounded-xl text-safe border border-white/5">
            <Filter size={18} />
          </button>
        </div>
        
        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Hospitals', 'Police', 'Ambulances', 'Towing'].map((cat) => (
            <button key={cat} className="px-4 py-1.5 rounded-full bg-navy/80 backdrop-blur-md border border-white/10 text-xs font-mono whitespace-nowrap hover:bg-safe/20 hover:text-safe transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Swipeable Bottom Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-navy/90 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-[500] flex flex-col"
        initial={{ top: '85%' }}
        animate={{ top: getSheetY() }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y < -50) {
            setSheetState(prev => prev === 'peek' ? 'half' : 'full');
          } else if (info.offset.y > 50) {
            setSheetState(prev => prev === 'full' ? 'half' : 'peek');
          }
        }}
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing" onClick={() => setSheetState(prev => prev === 'peek' ? 'half' : 'peek')}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h3 className="font-condensed text-xl font-bold tracking-wide">Nearby Services</h3>
          
          {services.map((service, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg leading-tight">{service.name}</h4>
                  <p className="text-xs font-mono text-muted uppercase mt-1">{service.type} • 2.4 km away</p>
                </div>
                <div className="bg-safe/20 text-safe px-2 py-1 rounded text-xs font-bold">Open</div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => window.open(`tel:${service.phone_primary}`)}
                  className="flex-1 bg-emergency text-white py-2 rounded-xl flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(215,38,56,0.3)] hover:bg-red-600 transition-colors"
                >
                  <Phone size={16} className="mr-2" /> Call Now
                </button>
                <button 
                  onClick={() => navigate(`/service/${idx}`)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-xl flex items-center justify-center font-bold text-sm hover:bg-white/20 transition-colors"
                >
                  <Navigation size={16} className="mr-2" /> Details
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="text-center text-muted font-mono py-10">No services found in area.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
