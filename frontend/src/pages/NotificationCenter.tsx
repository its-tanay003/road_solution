import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  CheckCheck, 
  Archive, 
  Trash2, 
  Download, 
  Calendar,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  BellOff,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useNotificationStore, type NotificationType } from '../store/notificationStore';
import { useBlockchainStore } from '../store/blockchainStore';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Panel } from '../components/ui/Panel';
import { NotificationBell } from '../components/NotificationBell';

export interface NotificationAction {
  id: string;
  label: string;
  link: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'ALL'>('ALL');

  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    archiveNotification, 
    deleteNotification,
    clearAll,
    exportLogs,
    isSuppressed,
    toggleDND
  } = useNotificationStore();
  const { addBlock } = useBlockchainStore();

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                             n.message.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'ALL' || n.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, search, filterType]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof filteredNotifications> = {};
    filteredNotifications.forEach(n => {
      const date = new Date(n.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'CRITICAL': return <ShieldAlert size={18} className="text-nx-red-primary" />;
      case 'HIGH': return <AlertTriangle size={18} className="text-nx-amber-primary" />;
      case 'MEDIUM': return <Info size={18} className="text-nx-blue-primary" />;
      case 'LOW': return <Bell size={18} className="text-nx-text-tertiary" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'CRITICAL': return <Badge variant="critical">Critical</Badge>;
      case 'HIGH': return <Badge variant="warning">High Priority</Badge>;
      case 'MEDIUM': return <Badge variant="info">Tactical</Badge>;
      case 'LOW': return <Badge variant="info">Archival</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-nx-bg-base text-nx-text-primary">
      {/* Header */}
      <header className="border-b border-nx-border p-6 bg-nx-bg-(--color-surface)/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-1.5 rounded-full ${isSuppressed ? 'bg-nx-amber-primary/20 text-nx-amber-primary' : 'bg-nx-blue-primary/20 text-nx-blue-primary'}`}>
              <Settings size={14} className={isSuppressed ? 'animate-spin-slow' : ''} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white uppercase leading-none">{isSuppressed ? 'Suppression Active' : 'Registry Live'}</p>
              <p className="text-[8px] font-medium text-nx-text-tertiary uppercase tracking-tighter mt-0.5">
                {isSuppressed ? 'Critical alerts only' : 'All channels monitored'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NotificationBell />
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                markAllAsRead();
                addBlock('SYSTEM', 'BULK_ACKNOWLEDGEMENT', 'DISPATCHER_PRO', { count: notifications.length });
              }}
              className="font-bold tracking-widest"
            >
              <CheckCheck size={14} className="mr-2" />
              ACKNOWLEDGE ALL
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={exportLogs}
              className="font-bold tracking-widest"
            >
              <Download size={14} className="mr-2" />
              EXPORT REGISTRY
            </Button>
            <Button 
              variant={isSuppressed ? "primary" : "secondary"}
              size="sm" 
              onClick={toggleDND}
              className="font-bold tracking-widest"
            >
              {isSuppressed ? <BellOff size={14} className="mr-2" /> : <Bell size={14} className="mr-2" />}
              {isSuppressed ? "SUPPRESSION ON" : "DND MODE"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto mt-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nx-text-tertiary" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH ALERTS BY KEYWORD, UNIT OR INCIDENT ID..."
              className="w-full bg-white/5 border border-nx-border rounded-(--radius-lg) py-2 pl-10 pr-4 text-sm focus:border-nx-red-primary transition-all outline-none font-mono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest border transition-all uppercase ${
                  filterType === type 
                    ? 'bg-nx-red-primary text-white border-nx-red-primary shadow-[0_0_12px_rgba(255,59,59,0.3)]' 
                    : 'bg-white/5 text-nx-text-tertiary border-nx-border hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          {/* Notifications List */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {Object.entries(groupedNotifications).length > 0 ? (
              Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-nx-border to-transparent" />
                    <div className="flex items-center gap-2 text-nx-text-tertiary">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black tracking-[0.2em] uppercase">{date}</span>
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-nx-border to-transparent" />
                  </div>

                  <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                      {items.map((notification) => (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group nexus-card border-l-4 transition-all hover:bg-white/2 ${
                            !notification.read ? 'bg-nx-red-primary/[0.03] border-nx-red-primary/50' : 'bg-white/1 border-nx-border/50 opacity-70'
                          }`}
                          style={{ borderLeftColor: `var(--nx-${notification.type.toLowerCase() === 'medium' ? 'blue' : notification.type.toLowerCase() === 'high' ? 'amber' : notification.type.toLowerCase() === 'critical' ? 'red' : 'border'}-primary)` }}
                        >
                          <div className="p-4 flex gap-4">
                            <div className="mt-1">{getTypeIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  {getTypeBadge(notification.type)}
                                  <span className="text-xs font-mono text-nx-text-tertiary">ID: {notification.id.split('-')[0]}</span>
                                </div>
                                <span className="text-[10px] font-mono text-nx-text-tertiary uppercase flex items-center gap-1">
                                  <Clock size={10} />
                                  {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <h3 className={`text-sm font-bold truncate ${!notification.read ? 'text-white' : 'text-nx-text-secondary'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-xs text-nx-text-tertiary mt-1 leading-relaxed line-clamp-2 font-medium">
                                {notification.message}
                              </p>
                              
                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                {notification.actions?.map(action => (
                                  <Button 
                                    key={action.id}
                                    variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => navigate(action.link)}
                                    className="h-7 text-[10px] tracking-widest font-black"
                                  >
                                    {action.label}
                                    <ExternalLink size={10} className="ml-1" />
                                  </Button>
                                ))}
                                {!notification.read && (
                                  <button 
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      addBlock(
                                        notification.incidentId || 'UNASSIGNED', 
                                        'NOTIFICATION_ACKNOWLEDGED', 
                                        'DISPATCHER_PRO', 
                                        { notificationId: notification.id, title: notification.title }
                                      );
                                    }}
                                    className="flex items-center gap-1 text-[10px] font-bold text-nx-blue-primary hover:underline uppercase ml-2"
                                  >
                                    <CheckCheck size={12} />
                                    Acknowledge
                                  </button>
                                )}
                                <div className="flex-1" />
                                <button 
                                  onClick={() => archiveNotification(notification.id)}
                                  className="p-1.5 rounded-md text-nx-text-tertiary hover:bg-white/10 transition-colors"
                                  title="Archive"
                                >
                                  <Archive size={14} />
                                </button>
                                <button 
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1.5 rounded-md text-nx-text-tertiary hover:bg-nx-red-primary/20 hover:text-nx-red-primary transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                  <Bell size={40} className="text-nx-text-tertiary" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Zero Alert Latency</h3>
                <p className="text-nx-text-tertiary text-sm mt-2 max-w-xs font-medium">
                  The registry is currently clear. No tactical notifications pending in the unread buffer.
                </p>
              </div>
            )}
          </div>

          {/* Stats / Sidebar */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <Panel className="p-5 border-nx-border/40">
              <h2 className="text-xs font-black tracking-widest text-nx-text-tertiary mb-6 flex items-center gap-2 uppercase">
                <div className="w-1.5 h-1.5 bg-nx-blue-primary rounded-full animate-ping" />
                Real-time Analytics
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] text-nx-text-secondary uppercase font-bold">Unread Buffer</span>
                    <span className="text-xl font-black text-nx-red-primary italic">{notifications.filter(n => !n.read).length}</span>
                  </div>
                  <div className="h-1 w-full bg-nx-border/30 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(notifications.filter(n => !n.read).length / Math.max(notifications.length, 1)) * 100}%` }}
                      className="h-full bg-nx-red-primary shadow-[0_0_8px_rgba(255,59,59,0.5)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-nx-border/50">
                  <div className="nexus-card p-3 bg-white/1">
                    <span className="text-[9px] font-black text-nx-text-tertiary uppercase tracking-widest block mb-1">Critical</span>
                    <span className="text-lg font-black text-white">{notifications.filter(n => n.type === 'CRITICAL').length}</span>
                  </div>
                  <div className="nexus-card p-3 bg-white/1">
                    <span className="text-[9px] font-black text-nx-text-tertiary uppercase tracking-widest block mb-1">High Prio</span>
                    <span className="text-lg font-black text-white">{notifications.filter(n => n.type === 'HIGH').length}</span>
                  </div>
                </div>

                <Button 
                  variant="danger-outline" 
                  size="sm" 
                  className="w-full font-black tracking-[0.2em] border-dashed"
                  onClick={clearAll}
                >
                  PURGE REGISTRY
                </Button>
              </div>
            </Panel>

            <Panel className="p-5 border-nx-border/40 bg-linear-to-br from-nx-blue-primary/5 to-transparent">
              <h3 className="text-xs font-black tracking-widest text-white mb-3 uppercase">AI Alert Aggregation</h3>
              <p className="text-[11px] text-nx-text-secondary leading-relaxed font-medium">
                Our ML models are currently analyzing the alert stream for patterns. Similar incidents in <span className="text-nx-blue-primary italic">Connaught Place</span> are being monitored for automated group-incident escalation.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-nx-bg-base bg-nx-border flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-nx-blue-primary/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-nx-blue-primary">{i}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-[9px] font-black text-nx-blue-primary uppercase tracking-widest">3 Patterns Detected</span>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
};
