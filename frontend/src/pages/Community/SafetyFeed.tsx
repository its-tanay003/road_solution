import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  MessageSquare,
  ThumbsUp,
  Share2,
  Bell,
  Filter
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface SafetyAlert {
  id: string;
  type: string;
  location: string;
  distance: string;
  time: string;
  description: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  updates: number;
}

export const SafetyFeed = () => {
  const [alerts] = useState<SafetyAlert[]>([
    { 
      id: '1', 
      type: 'Flash Flood Warning', 
      location: 'Connaught Place Area', 
      distance: '1.2 km away', 
      time: 'Just now', 
      description: 'Severe waterlogging reported near Metro Station. Avoid basement parking.',
      severity: 'HIGH',
      updates: 12
    },
    { 
      id: '2', 
      type: 'Traffic Congestion', 
      location: 'Ring Road South', 
      distance: '3.5 km away', 
      time: '15 mins ago', 
      description: 'Accident cleared but heavy delays persist towards Airport.',
      severity: 'MODERATE',
      updates: 4
    },
    { 
      id: '3', 
      type: 'Road Maintenance', 
      location: 'NH-44 Flyover', 
      distance: '5.8 km away', 
      time: '1 hour ago', 
      description: 'Scheduled maintenance work. Right two lanes closed for next 4 hours.',
      severity: 'LOW',
      updates: 2
    }
  ]);

  return (
    <div className="min-h-screen bg-(--nx-bg-base) text-(--nx-text-primary) pb-24 pt-24 px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-(--nx-blue-primary)/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-(--nx-blue-primary)/10 border border-(--nx-blue-primary)/30 rounded-sm flex items-center justify-center text-(--nx-blue-primary)">
                <Shield size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">COMMUNITY <span className="text-(--nx-blue-primary)">INTEL</span></h1>
            </div>
            <p className="text-(--nx-text-dim) text-xs font-mono uppercase tracking-widest">Sector Intelligence • 10KM Operational Radius</p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="secondary" size="sm" className="gap-2 font-bold tracking-widest">
                <Filter size={14} /> FILTER
             </Button>
             <Button variant="secondary" size="sm" className="gap-2 font-bold tracking-widest">
                <Bell size={14} /> ALERTS
             </Button>
          </div>
        </header>

        <div className="space-y-6">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="nexus-card bg-(--nx-bg-[var(--color-surface)]) hover:border-(--nx-border-active) transition-all group overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-sm border flex items-center justify-center shrink-0 ${
                        alert.severity === 'HIGH' ? 'bg-(--nx-red-dim) border-(--nx-red-primary)/30 text-(--nx-red-primary) shadow-[0_0_15px_rgba(255,59,59,0.1)]' :
                        alert.severity === 'MODERATE' ? 'bg-(--nx-amber-dim) border-(--nx-amber-primary)/30 text-(--nx-amber-primary)' : 
                        'bg-(--nx-blue-dim) border-(--nx-blue-primary)/30 text-(--nx-blue-primary)'
                      }`}>
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="font-black text-lg text-white uppercase tracking-tight">{alert.type}</h3>
                           <Badge variant={alert.severity === 'HIGH' ? 'critical' : alert.severity === 'MODERATE' ? 'warning' : 'info'}>
                              {alert.severity} PRIORITY
                           </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-(--nx-text-dim) uppercase tracking-tighter">
                          <span className="flex items-center gap-1.5"><MapPin size={12} className="text-(--nx-blue-primary)" /> {alert.location}</span>
                          <span className="w-1 h-1 bg-(--nx-border) rounded-full" />
                          <span>{alert.distance}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-(--nx-text-dim) uppercase font-bold">{alert.time}</span>
                  </div>

                  <p className="text-(--nx-text-secondary) text-sm mb-8 leading-relaxed font-sans border-l-2 border-(--nx-border) pl-4">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-(--nx-border)">
                    <div className="flex items-center gap-8">
                      <button className="flex items-center gap-2 text-[10px] font-black text-(--nx-text-tertiary) hover:text-(--nx-blue-primary) transition-colors uppercase tracking-widest">
                        <MessageSquare size={16} /> {alert.updates} INTEL RELAYS
                      </button>
                      <button className="flex items-center gap-2 text-[10px] font-black text-(--nx-text-tertiary) hover:text-(--nx-green-primary) transition-colors uppercase tracking-widest">
                        <ThumbsUp size={16} /> VERIFY SIGNAL
                      </button>
                    </div>
                    <button 
                      className="p-2.5 bg-white/2 border border-(--nx-border) rounded-sm hover:border-(--nx-border-active) hover:text-white transition-all text-(--nx-text-dim)"
                      title="Share Alert"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
                {/* Visual scanline */}
                <div className="absolute top-0 right-0 w-1 h-full bg-linear-to-b from-transparent via-(--nx-blue-primary) to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <button className="w-full h-16 bg-(--nx-blue-primary) text-navy font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(10,132,255,0.2)] group overflow-hidden">
             BROADCAST FIELD ALERT <ChevronRight size={18} />
             <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
