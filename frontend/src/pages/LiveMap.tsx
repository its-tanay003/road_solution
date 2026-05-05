import { useState } from 'react';
import { MapView } from '../components/MapView';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Phone, Navigation, Activity, Shield, Map as MapIcon, Layers, Hospital } from 'lucide-react';
import { useServicesStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { HospitalCapacityPanel } from '../components/HospitalCapacityPanel';

export const LiveMap = () => {
  const { services } = useServicesStore();
  const [sheetState, setSheetState] = useState<'peek' | 'half' | 'full'>('peek');
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(false);
  const [showBlackSpots, setShowBlackSpots] = useState(false);
  const [showHospitalPanel, setShowHospitalPanel] = useState(false);
  const navigate = useNavigate();

  const getSheetY = () => {
    switch (sheetState) {
      case 'peek': return 'calc(100% - 100px)';
      case 'half': return '50%';
      case 'full': return '120px';
      default: return 'calc(100% - 100px)';
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-(--nx-bg-base)">
      {/* Full Bleed Map with Scanline Filter */}
      <div className="absolute inset-0 z-0">
        <MapView showRiskHeatmap={showRiskHeatmap} showBlackSpots={showBlackSpots} />
        {/* CRT/Scanline Overlay specifically for map to give it tactical feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_3px)] z-10" />
      </div>

      {/* Floating Tactical Overlay Controls */}
      <div className="absolute top-6 left-6 right-6 z-400 flex flex-col gap-4 pointer-events-none">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-2 pointer-events-auto">
             <div className="nexus-card bg-(--nx-bg-surface)/90 backdrop-blur-md border-(--nx-border) p-1.5 flex items-center shadow-2xl w-80">
                <Search className="text-(--nx-text-tertiary) ml-3" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH COORDINATES / ASSETS..." 
                  className="bg-transparent border-none outline-none text-white flex-1 ml-3 font-mono text-[11px] placeholder:text-(--nx-text-dim)"
                />
                <Button variant="secondary" size="sm" className="min-w-0 p-2">
                  <Filter size={14} />
                </Button>
             </div>
             <div className="flex gap-2">
                <Badge variant="mesh" className="bg-(--nx-bg-surface)/90 backdrop-blur-md">MAP-RELAY: 12ms</Badge>
                <Badge variant="active" className="bg-(--nx-bg-surface)/90 backdrop-blur-md">GPS: FIXED</Badge>
             </div>
          </div>

          <div className="flex flex-col gap-2 items-end pointer-events-auto">
             <Button 
               variant={showBlackSpots ? 'primary' : 'secondary'} 
               size="sm" 
               className="gap-2 font-bold"
               onClick={() => setShowBlackSpots(!showBlackSpots)}
             >
               <MapIcon size={14} />
               BLACK SPOTS: {showBlackSpots ? 'ENABLED' : 'DISABLED'}
             </Button>
             <Button 
               variant={showRiskHeatmap ? 'primary' : 'secondary'} 
               size="sm" 
               className="gap-2 font-bold"
               onClick={() => setShowRiskHeatmap(!showRiskHeatmap)}
             >
               <Layers size={14} />
               RISK OVERLAY: {showRiskHeatmap ? 'ENABLED' : 'DISABLED'}
             </Button>
             <Button 
               variant={showHospitalPanel ? 'primary' : 'secondary'} 
               size="sm" 
               className="gap-2 font-bold"
               onClick={() => setShowHospitalPanel(!showHospitalPanel)}
             >
               <Hospital size={14} />
               HOSPITAL CAPACITY: {showHospitalPanel ? 'ENABLED' : 'DISABLED'}
             </Button>
             <div className="nexus-card bg-[var(--nx-bg-surface)]/90 backdrop-blur-md p-2 flex gap-1">
                {[MapIcon, Activity, Shield].map((Icon, i) => (
                   <Button key={i} variant="ghost" size="sm" className="p-2 min-w-0 hover:bg-white/5">
                      <Icon size={16} />
                   </Button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Hospital Capacity Sidebar Panel */}
      <AnimatePresence>
        {showHospitalPanel && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-6 top-48 bottom-32 w-96 z-500 pointer-events-auto"
          >
            <div className="nexus-card bg-(--nx-bg-surface)/95 backdrop-blur-xl h-full p-6 flex flex-col border-(--nx-border) shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]">
              <HospitalCapacityPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable Bottom Sheet */}
      <motion.div
        className="absolute left-0 right-0 bg-(--nx-bg-surface)/95 backdrop-blur-3xl border-t border-(--nx-border) z-500 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
        initial={{ top: 'calc(100% - 100px)' }}
        animate={{ top: getSheetY() }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(_e, info) => {
          if (info.offset.y < -50) {
            setSheetState(prev => prev === 'peek' ? 'half' : 'full');
          } else if (info.offset.y > 50) {
            setSheetState(prev => prev === 'full' ? 'half' : 'peek');
          }
        }}
      >
        {/* Drag Handle & Info Strip */}
        <div 
          className="w-full flex flex-col items-center py-2 cursor-grab active:cursor-grabbing border-b border-(--nx-border)/50"
          onClick={() => setSheetState(prev => prev === 'peek' ? 'half' : 'peek')}
        >
          <div className="w-12 h-[3px] bg-(--nx-border-active) rounded-full mb-2 opacity-50"></div>
          <div className="flex items-center gap-4 px-6 w-full justify-between">
            <span className="text-[10px] font-mono text-(--nx-text-tertiary) uppercase tracking-widest">Nearby Tactical Assets</span>
            <span className="text-[10px] font-mono text-(--nx-blue-primary) uppercase">{services.length} UNITS DETECTED</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
          {services.map((service, idx) => (
            <div key={idx} className="nexus-card p-4 group hover:border-(--nx-border-active) transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-(--nx-blue-primary) transition-colors">{service.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={service.type === 'hospital' ? 'critical' : 'active'} className="text-[8px] py-0">
                      {service.type}
                    </Badge>
                    <span className="text-[10px] font-mono text-(--nx-text-dim) uppercase">2.4 KM • 6 MIN</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1 text-[10px] gap-2"
                  onClick={() => window.open(`tel:${service.phone_primary}`)}
                >
                  <Phone size={12} /> CALL
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1 text-[10px] gap-2"
                  onClick={() => navigate(`/service/${idx}`)}
                >
                  <Navigation size={12} /> COMMAND
                </Button>
              </div>
            </div>
          ))}
          
          {services.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30">
               <MapIcon size={48} className="mb-4" />
               <p className="text-xs font-mono uppercase tracking-[0.2em]">No assets in vicinity</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
