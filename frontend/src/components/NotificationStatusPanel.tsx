import React from 'react';
import { motion } from 'framer-motion';
import { useNotificationStatusStore } from '../store/notificationStatusStore';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Bell, 
  Navigation2, 
  Smartphone, 
  Siren,
  LucideIcon 
} from 'lucide-react';

interface ChannelConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  description: string;
}

const CHANNEL_CONFIGS: Record<string, ChannelConfig> = {
  whatsapp: { 
    icon: MessageSquare, 
    label: 'WhatsApp', 
    color: 'text-emerald-400',
    description: 'Emergency contacts notified via WhatsApp'
  },
  push: { 
    icon: Bell, 
    label: 'Push Notification', 
    color: 'text-blue-400',
    description: 'In-app alerts sent to nearby verified users'
  },
  nearby: { 
    icon: Navigation2, 
    label: 'Nearby Volunteers', 
    color: 'text-orange-400',
    description: 'Dispatching trained first responders in vicinity'
  },
  sms: { 
    icon: Smartphone, 
    label: 'Emergency SMS', 
    color: 'text-purple-400',
    description: 'Fallback SMS gateway activated'
  },
  '112': { 
    icon: Siren, 
    label: 'India 112', 
    color: 'text-red-400',
    description: 'Direct uplink to National Emergency Response System'
  }
};

export const NotificationStatusPanel: React.FC = () => {
  const { statuses } = useNotificationStatusStore();

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono uppercase tracking-widest text-white/50">Dispatch Channels</h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-medium text-blue-400 uppercase">Live Tracking</span>
        </div>
      </div>
      
      <div className="grid gap-2">
        {Object.entries(CHANNEL_CONFIGS).map(([id, config]) => {
          const status = statuses[id as keyof typeof statuses] || 'IDLE';
          const Icon = config.icon;
          
          return (
            <motion.div
              key={id}
              initial={false}
              animate={{ 
                opacity: status === 'IDLE' ? 0.4 : 1,
                scale: status === 'SENDING' ? 1.02 : 1
              }}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                status === 'SENDING' ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent'
              }`}
            >
              <div className={`p-2 rounded-lg ${status === 'IDLE' ? 'bg-white/5' : 'bg-white/10 shadow-lg'}`}>
                <Icon size={18} className={status === 'IDLE' ? 'text-white/20' : config.color} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold tracking-tight ${status === 'IDLE' ? 'text-white/30' : 'text-white'}`}>
                    {config.label}
                  </span>
                  <StatusBadge status={status} />
                </div>
                <p className="text-[10px] text-white/40 truncate mt-0.5">
                  {status === 'IDLE' ? 'Pending activation...' : config.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'SENDING':
      return (
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-1 h-1 rounded-full bg-blue-400"
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-tighter">Sending</span>
        </div>
      );
    case 'SENT':
    case 'DELIVERED':
      return (
        <div className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 size={12} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">Verified</span>
        </div>
      );
    case 'FAILED':
      return (
        <div className="flex items-center gap-1 text-red-400">
          <AlertCircle size={12} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">Failed</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-white/20">
          <Clock size={12} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">Idle</span>
        </div>
      );
  }
};
