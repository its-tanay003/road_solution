import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  MessageSquare,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { TiltCard } from '../../components/TiltCard';
import { ReputationBadge } from '../../components/User/ReputationBadge';

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
    <div className="min-h-screen bg-black text-slate-200 pb-24 pt-24 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Shield className="text-cyan-400" size={32} />
            Community <span className="text-cyan-400">Safety Feed</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Verified alerts within your 10km radius</p>
        </header>

        <div className="space-y-6">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <TiltCard className="overflow-hidden border-white/5 bg-slate-900/40 backdrop-blur-md">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                        alert.severity === 'MODERATE' ? 'bg-amber-500/20 text-amber-500' : 'bg-cyan-500/20 text-cyan-500'
                      }`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{alert.type}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={10} /> {alert.location} • {alert.distance}
                          </p>
                          <ReputationBadge level={i % 3 === 0 ? 'VERIFIED' : 'TRAINED'} points={1200 + (i * 50)} />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 uppercase">{alert.time}</span>
                  </div>

                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors">
                        <MessageSquare size={14} /> {alert.updates} Updates
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors">
                        <ThumbsUp size={14} /> Verify
                      </button>
                    </div>
                    <button 
                      aria-label="Share alert"
                      className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-8 py-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          Post a Safety Alert <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
};
