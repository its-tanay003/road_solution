import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ExternalLink, ShieldAlert, AlertTriangle, Info, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore, type NotificationType } from '../store/notificationStore';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationType | 'ALL'>('ALL');
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    getFilteredNotifications, 
    markAsRead, 
    markAllAsRead, 
    isSuppressed, 
    setSuppression 
  } = useNotificationStore();

  const notifications = getFilteredNotifications({ type: filter === 'ALL' ? undefined : filter });
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'CRITICAL': return 'text-nx-red-primary';
      case 'HIGH': return 'text-nx-amber-primary';
      case 'MEDIUM': return 'text-nx-blue-primary';
      case 'LOW': return 'text-nx-text-dim';
      default: return 'text-nx-text-primary';
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'CRITICAL': return <ShieldAlert size={14} />;
      case 'HIGH': return <AlertTriangle size={14} />;
      case 'MEDIUM': return <Info size={14} />;
      case 'LOW': return <Bell size={14} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`nexus-card p-2 bg-white/5 border-nx-border hover:bg-white/10 transition-all relative group ${isOpen ? 'bg-white/10' : ''}`}
        title="NOTIFICATIONS"
      >
        <Bell size={18} className={`${unreadCount > 0 ? 'text-white' : 'text-nx-text-tertiary'} group-hover:text-white`} />
        {unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-nx-red-primary rounded-full flex items-center justify-center border-2 border-nx-bg-base"
          >
            <span className="text-[8px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-nx-bg-elevated border border-nx-border shadow-2xl z-1000 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-nx-border bg-white/2 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Notification Engine</h3>
                <p className="text-[9px] text-nx-text-tertiary uppercase mt-0.5">Real-time Tactical Alerts</p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setSuppression(!isSuppressed)}
                  className={`p-1.5 rounded-[2px] transition-colors ${isSuppressed ? 'bg-nx-red-dim text-nx-red-primary' : 'text-nx-text-dim hover:text-white'}`}
                  title={isSuppressed ? "Resume all alerts" : "Suppress non-critical"}
                >
                  <BellOff size={12} />
                </button>
                <button 
                  onClick={() => markAllAsRead()}
                  className="p-1.5 text-nx-text-dim hover:text-white transition-colors"
                  title="Mark all as read"
                >
                  <Check size={12} />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-2 py-1.5 border-b border-nx-border bg-black/20 flex gap-1 overflow-x-auto no-scrollbar">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t as NotificationType | 'ALL')}
                  className={`px-2 py-0.5 rounded-[2px] text-[8px] font-bold uppercase transition-all whitespace-nowrap ${
                    filter === t 
                      ? 'bg-nx-blue-primary text-white' 
                      : 'text-nx-text-tertiary hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[350px] overflow-y-auto no-scrollbar">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.incidentId) navigate(`/incident/${n.incidentId}`);
                    }}
                    className={`p-3 border-b border-nx-border hover:bg-white/3 transition-all cursor-pointer group relative ${!n.read ? 'bg-white/1' : ''}`}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-nx-blue-primary" />
                    )}
                    <div className="flex gap-3">
                      <div className={`mt-1 ${getTypeColor(n.type)}`}>
                        {getTypeIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-tight ${!n.read ? 'text-white' : 'text-nx-text-secondary'}`}>
                            {n.title}
                          </span>
                          <span className="text-[8px] font-mono text-nx-text-dim">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-nx-text-tertiary leading-tight line-clamp-2 mb-2">
                          {n.message}
                        </p>
                        {n.actions && n.actions.length > 0 && (
                          <div className="flex gap-2">
                            {n.actions.map((action, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (action.link) navigate(action.link);
                                }}
                                className="px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-nx-border rounded-[2px] text-[8px] font-bold uppercase text-white transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell size={24} className="mx-auto text-nx-text-dim opacity-20 mb-3" />
                  <p className="text-[10px] font-bold text-nx-text-dim uppercase tracking-widest">No active alerts</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="p-3 bg-white/2 border-t border-nx-border text-[9px] font-black text-nx-blue-primary uppercase tracking-[0.2em] text-center hover:bg-nx-blue-primary/10 transition-all flex items-center justify-center gap-2"
            >
              Access Command Center
              <ExternalLink size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
