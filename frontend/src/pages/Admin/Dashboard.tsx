import { useState, useEffect, type ReactNode } from 'react';
import { 
  ShieldCheck, Activity, Users, MapPin, 
  AlertTriangle, Clock, Radio, 
  Zap, Globe, Cpu, Server, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Panel } from '../../components/ui/Panel';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Incident {
  id: string;
  location: string;
  severity: 'critical' | 'warning' | 'active';
  time: string;
  telemetry: { speed: string; gForce: string };
  type: 'sos' | 'bystander';
  victimStatus?: string;
}

interface Stats {
  totalServices: number;
  activeSos: number;
  pendingFlags: number;
  meshNodes: number;
  avgResponseTime: string;
}

export const Dashboard = () => {
  const [stats] = useState<Stats>({
    totalServices: 142,
    activeSos: 3,
    pendingFlags: 12,
    meshNodes: 124,
    avgResponseTime: "4:32"
  });

  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([
    { id: 'SOS-912', location: 'New Delhi, Area 5', severity: 'critical', time: '2m ago', telemetry: { speed: '0km/h', gForce: '4.2g' }, type: 'sos' },
    { id: 'SOS-884', location: 'Gurgaon, Sector 44', severity: 'warning', time: '12m ago', telemetry: { speed: '12km/h', gForce: '0.8g' }, type: 'sos' },
    { id: 'SOS-771', location: 'Noida, Expressway', severity: 'active', time: '45m ago', telemetry: { speed: '0km/h', gForce: '2.1g' }, type: 'sos' },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Socket.io integration for live updates
    const socket = io(SOCKET_URL);
    
    interface BystanderReportData {
      id: string;
      coords: { lat: number; lng: number };
      victimStatus: string;
    }

    socket.on('bystander:report', (report: BystanderReportData) => {
      setActiveIncidents(prev => [{
        id: report.id,
        location: `${report.coords.lat.toFixed(4)}, ${report.coords.lng.toFixed(4)}`,
        severity: report.victimStatus === 'CRITICAL' ? 'critical' : report.victimStatus === 'UNCONSCIOUS' ? 'warning' : 'active',
        time: 'Just now',
        telemetry: { speed: 'N/A', gForce: 'Bystander' },
        type: 'bystander',
        victimStatus: report.victimStatus
      }, ...prev]);
    });

    return () => {
      clearInterval(timer);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-(--nx-bg-base) text-(--nx-text-primary) font-sans selection:bg-(--nx-red-primary) selection:text-white flex flex-col">
      {/* Tactical Header */}
      <header className="h-16 px-8 border-b border-(--nx-border) flex items-center justify-between sticky top-0 z-50 bg-(--nx-bg-base)/80 backdrop-blur-md">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-(--nx-red-primary) rounded-sm flex items-center justify-center shadow-[0_0_12px_rgba(255,59,59,0.3)]">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter text-white leading-none">ROADSoS <span className="text-(--nx-red-primary)">COMMAND</span></h1>
              <p className="text-[10px] text-(--nx-text-tertiary) uppercase tracking-widest mt-1">Global Intelligence Hub</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 border-l border-(--nx-border) pl-10">
             <div className="flex flex-col">
                <span className="nexus-label">Region</span>
                <span className="text-xs font-mono text-white mt-0.5">ASIA-SOUTH-1</span>
             </div>
             <div className="flex flex-col">
                <span className="nexus-label">Core Version</span>
                <span className="text-xs font-mono text-(--nx-text-tertiary) mt-0.5">v2.4.0-STABLE</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3 bg-white/5 border border-(--nx-border) px-4 py-2 rounded-sm">
              <Cpu size={14} className="text-(--nx-blue-primary)" />
              <div className="h-3 w-px bg-(--nx-border)" />
              <span className="text-[10px] font-mono text-(--nx-text-secondary)">AI ENGINE: ONLINE</span>
           </div>
           
           <div className="text-right hidden sm:block">
            <div className="text-sm font-mono text-white leading-none">{currentTime.toLocaleTimeString([], { hour12: false })}</div>
            <div className="text-[10px] text-(--nx-text-tertiary) uppercase mt-1">TACTICAL TIME</div>
          </div>

          <Button variant="secondary" size="sm">LOGOUT</Button>
        </div>
      </header>

      <main className="p-8 grid grid-cols-12 gap-8 max-w-[1800px] mx-auto w-full flex-1">
        {/* Top Metric Cards */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard title="ACTIVE SOS" value={stats.activeSos} icon={<AlertTriangle size={18} />} variant="critical" />
          <MetricCard title="AVG RESPONSE" value={stats.avgResponseTime} icon={<Clock size={18} />} variant="active" />
          <MetricCard title="MESH NODES" value={stats.meshNodes} icon={<Radio size={18} />} variant="mesh" />
          <MetricCard title="COMMUNITY" value="1,204" icon={<Users size={18} />} variant="info" />
          <MetricCard title="AI UPTIME" value="99.9%" icon={<Zap size={18} />} variant="ai" />
        </div>

        {/* Live Incident Stream */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          <Panel 
            title="Live Incident Stream" 
            icon={Activity} 
            subtitle="Priority triage queue"
            action={<Badge variant="critical" className="animate-pulse">Live Tracking</Badge>}
          >
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activeIncidents.map((incident) => (
                  <motion.div 
                    key={incident.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`nexus-card p-4 hover:border-(--nx-border-active) transition-all cursor-pointer group ${
                      incident.type === 'bystander' ? 'border-l-2 border-l-(--nx-blue-primary)' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${
                            incident.severity === 'critical' ? 'bg-(--nx-red-dim) border-(--nx-red-primary)/30 text-(--nx-red-primary)' : 'bg-(--nx-amber-dim) border-(--nx-amber-primary)/30 text-(--nx-amber-primary)'
                          }`}>
                             {incident.type === 'bystander' ? <Users size={20} /> : <AlertTriangle size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              {incident.type === 'bystander' ? (
                                <span className="text-[10px] font-bold text-(--nx-blue-primary) uppercase tracking-wider flex items-center gap-1">
                                  👤 Bystander Report
                                </span>
                              ) : (
                                <span className="text-sm font-bold text-white font-mono">{incident.id}</span>
                              )}
                              <Badge variant={incident.severity}>
                                {incident.victimStatus || incident.severity.toUpperCase()}
                              </Badge>
                              {incident.type === 'bystander' && (
                                <span className="text-[10px] font-mono text-(--nx-text-tertiary)">{incident.id}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-(--nx-text-tertiary) uppercase font-mono">
                               <span className="flex items-center gap-1"><MapPin size={10} /> {incident.location}</span>
                               <span className="w-1 h-1 bg-(--nx-border) rounded-full" />
                               <span>{incident.time}</span>
                            </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-8">
                          <div className="text-right hidden sm:block">
                             <div className="text-[9px] text-(--nx-text-dim) uppercase font-bold mb-1">Telemetry</div>
                             <div className="text-xs font-mono text-(--nx-green-primary)">{incident.telemetry.speed} • {incident.telemetry.gForce}</div>
                          </div>
                          <Button variant="secondary" size="sm" className="min-w-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Maximize2 size={14} />
                          </Button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Panel>

          <Panel title="Geospatial Risk Analysis" icon={Globe} subtitle="Mesh data integration">
             <div className="h-[350px] relative rounded-sm overflow-hidden border border-(--nx-border)">
                <div className="absolute inset-0 opacity-40 grayscale contrast-150 brightness-50">
                   <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" alt="Map" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-64 h-64 border border-(--nx-blue-primary)/20 rounded-full animate-ping" />
                   <div className="absolute z-10 text-center">
                      <div className="nexus-label mb-2">Neural Scan in Progress</div>
                      <div className="text-xs font-mono text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-sm border border-(--nx-border)">
                         SCANNING SECTOR 04-G...
                      </div>
                   </div>
                </div>
                {/* Random risk nodes */}
                <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-(--nx-red-primary) rounded-full animate-pulse shadow-[0_0_10px_var(--nx-red-primary)]" />
                <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-(--nx-amber-primary) rounded-full animate-pulse shadow-[0_0_10px_var(--nx-amber-primary)]" />
             </div>
          </Panel>
        </div>

        {/* Sidebar: System & Assets */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
           <Panel title="System Infrastructure" icon={Server} subtitle="Integrity & performance">
              <div className="space-y-4">
                 <StatusRow label="Cloud Gateway" status="NOMINAL" variant="active" />
                 <StatusRow label="P2P Mesh Nodes" status="124 ACTIVE" variant="mesh" />
                 <StatusRow label="Neural Engine" status="CONNECTED" variant="ai" />
                 <StatusRow label="Vault Encryption" status="SECURE" variant="info" />
              </div>
           </Panel>

           <Panel title="Top Regional Assets" icon={Shield} subtitle="Performance metrics">
              <div className="space-y-3">
                 {[
                   { name: 'AIIMS Delhi Trauma', type: 'hospital', score: '98%' },
                   { name: 'Paramedic Unit 42', type: 'ambulance', score: '94%' },
                   { name: 'Police Sector 7', type: 'police', score: '99%' },
                 ].map((asset, i) => (
                   <div key={i} className="p-3 bg-white/1 border border-(--nx-border) rounded-sm flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{asset.name}</div>
                        <div className="text-[9px] text-(--nx-text-tertiary) uppercase mt-1">{asset.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-(--nx-blue-primary)">{asset.score}</span>
                        <Zap size={10} className="text-(--nx-amber-primary)" />
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="secondary" className="w-full mt-6 text-[10px] tracking-widest">DOWNLOAD OPS REPORT</Button>
           </Panel>

           <div className="mt-auto">
             <Panel title="Critical Alerts" icon={AlertTriangle} variant="danger">
                <div className="p-3 bg-(--nx-red-dim) border border-(--nx-red-primary)/20 rounded-sm">
                   <div className="text-[10px] font-bold text-(--nx-red-primary) uppercase mb-1">Severe Weather Warning</div>
                   <p className="text-[11px] text-white/80 leading-relaxed">
                     Heavy fog conditions in Gurgaon sector 44. Expected 40% increase in incident probability.
                   </p>
                </div>
              </Panel>
           </div>
        </div>
      </main>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant: 'critical' | 'active' | 'mesh' | 'info' | 'ai';
}

const MetricCard = ({ title, value, icon, variant }: MetricCardProps) => {
  const styles = {
    critical: 'border-(--nx-red-primary)/20 bg-(--nx-red-dim) text-(--nx-red-primary)',
    active: 'border-(--nx-green-primary)/20 bg-(--nx-green-dim) text-(--nx-green-primary)',
    mesh: 'border-(--nx-teal-primary)/20 bg-(--nx-teal-dim) text-(--nx-teal-primary)',
    info: 'border-(--nx-blue-primary)/20 bg-(--nx-blue-dim) text-(--nx-blue-primary)',
    ai: 'border-(--nx-purple-primary)/20 bg-(--nx-purple-dim) text-(--nx-purple-primary)'
  };

  return (
    <div className={`p-5 rounded-sm border ${styles[variant]} flex flex-col gap-4`}>
       <div className="flex items-center justify-between opacity-80">
          <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
          {icon}
       </div>
       <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
    </div>
  );
};

interface StatusRowProps {
  label: string;
  status: string;
  variant: 'critical' | 'active' | 'mesh' | 'info' | 'ai';
}

const StatusRow = ({ label, status, variant }: StatusRowProps) => (
  <div className="flex items-center justify-between py-2.5 border-b border-(--nx-border) last:border-0">
    <span className="text-xs text-(--nx-text-secondary)">{label}</span>
    <div className="flex items-center gap-2">
      <Badge variant={variant}>{status}</Badge>
    </div>
  </div>
);

const Maximize2 = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
