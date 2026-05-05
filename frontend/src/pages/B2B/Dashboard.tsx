import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Activity, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  BarChart3,
  Download,
  Zap,
  Globe
} from 'lucide-react';
import { LiveMap } from '../LiveMap';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface Incident {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'active' | 'info';
  location: string;
  eta: string;
  patientStatus: string;
  timestamp: string;
}

export const B2BDashboard = () => {
  const [incidents] = useState<Incident[]>([
    { id: '1', type: 'Vehicle Collision', severity: 'critical', location: 'New Delhi, Sector 12', eta: '4 mins', patientStatus: 'Unconscious', timestamp: '2 mins ago' },
    { id: '2', type: 'Medical Emergency', severity: 'warning', location: 'Mumbai, Andheri West', eta: '8 mins', patientStatus: 'Respiratory Distress', timestamp: '5 mins ago' },
    { id: '3', type: 'Minor Accident', severity: 'active', location: 'Bangalore, Koramangala', eta: '12 mins', patientStatus: 'Stable', timestamp: '10 mins ago' },
  ]);

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base)] text-[var(--nx-text-primary)] font-sans p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto">
      {/* Header Area */}
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-[var(--nx-blue-primary)] rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(0,184,212,0.3)]">
                 <Building2 className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase text-white">
                INSTITUTIONAL <span className="text-[var(--nx-blue-primary)]">RELAY HUB</span>
              </h1>
           </div>
           <p className="text-[10px] text-[var(--nx-text-dim)] font-mono uppercase tracking-[0.3em]">Responder Network Control • Sector: HQ-01</p>
        </div>
        
        <div className="flex gap-4">
           <Button variant="secondary" size="sm" className="gap-2">
              <Filter size={14} /> FILTERS
           </Button>
           <Button variant="primary" size="sm" className="gap-2">
              <Download size={14} /> EXPORT INTEL
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard label="ACTIVE SOS" value="12" icon={<AlertCircle size={20} />} variant="critical" />
        <MetricCard label="AVG RESPONSE" value="6:42" icon={<Clock size={20} />} variant="active" />
        <MetricCard label="UNITS EN-ROUTE" value="08" icon={<Activity size={20} />} variant="mesh" />
        <MetricCard label="TOTAL RESOLVED" value="1,284" icon={<CheckCircle2 size={20} />} variant="info" />
      </div>

      {/* Main Layout: Split Pane */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-8">
        {/* Left: Incident Queue */}
        <div className="col-span-12 lg:col-span-4">
           <Panel 
             title="Patient Inflow Stream" 
             icon={Users} 
             subtitle="Real-time triage queue"
             action={<Badge variant="critical" className="animate-pulse">LIVE FEED</Badge>}
           >
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {incidents.map((incident: Incident) => (
                  <motion.div 
                    key={incident.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="nexus-card p-4 group hover:border-[var(--nx-border-active)] transition-all cursor-pointer bg-white/[0.01]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={incident.severity}>{incident.severity}</Badge>
                      <span className="text-[10px] font-mono text-[var(--nx-text-dim)]">{incident.timestamp}</span>
                    </div>
                    <h3 className="font-bold text-white text-md mb-2 group-hover:text-[var(--nx-blue-primary)] transition-colors">{incident.type}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--nx-text-dim)] uppercase mb-4">
                      <MapPin size={10} /> {incident.location}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-[var(--nx-border)]/50">
                       <div>
                          <div className="nexus-label mb-1">ETA</div>
                          <div className="text-sm font-black text-[var(--nx-blue-primary)] font-mono">{incident.eta}</div>
                       </div>
                       <div>
                          <div className="nexus-label mb-1">PATIENT STATUS</div>
                          <div className="text-sm font-bold text-white uppercase truncate">{incident.patientStatus}</div>
                       </div>
                    </div>
                    
                    <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight size={16} className="text-[var(--nx-blue-primary)]" />
                    </div>
                  </motion.div>
                ))}
              </div>
           </Panel>
        </div>

        {/* Right: Live Command Map & Analytics */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <Panel title="Regional Tactical Grid" icon={Globe} subtitle="Asset positioning & telemetry">
              <div className="h-[480px] rounded-sm border border-[var(--nx-border)] overflow-hidden relative">
                 <div className="absolute top-4 right-4 z-20">
                    <Badge variant="active" className="bg-black/60 backdrop-blur-md">MAP-RELAY: NOMINAL</Badge>
                 </div>
                 <LiveMap />
              </div>
           </Panel>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Panel title="Resource Saturation" icon={BarChart3} subtitle="Live unit allocation">
                 <div className="space-y-5 py-2">
                    {[
                      { label: 'AMBULANCE FLEET', used: 6, total: 10, color: 'var(--nx-blue-primary)' },
                      { label: 'TRAUMA BEDS', used: 4, total: 5, color: 'var(--nx-red-primary)' },
                      { label: 'RAPID RESPONDERS', used: 22, total: 30, color: 'var(--nx-amber-primary)' },
                    ].map((res, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--nx-text-dim)] mb-2">
                          <span>{res.label}</span>
                          <span className="text-white">{res.used} / {res.total}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.03] border border-[var(--nx-border)] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(res.used / res.total) * 100}%` }}
                            style={{ backgroundColor: res.color }}
                            className="h-full shadow-[0_0_8px_currentColor]"
                          />
                        </div>
                      </div>
                    ))}
                 </div>
              </Panel>

              <Panel title="Network Latency (SLA)" icon={Zap} subtitle="Mesh data stability">
                 <div className="h-28 flex items-end gap-1.5 mb-4">
                   {[40, 60, 30, 80, 50, 40, 90, 20, 60, 70, 40, 30, 50, 40, 60, 20, 80].map((v, i) => (
                     <motion.div 
                       key={i}
                       initial={{ height: 0 }}
                       animate={{ height: `${v}%` }}
                       className="flex-1 bg-[var(--nx-blue-primary)]/10 border-t border-[var(--nx-blue-primary)]/40 hover:bg-[var(--nx-blue-primary)]/40 transition-colors"
                     />
                   ))}
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-mono text-[var(--nx-text-dim)] border-t border-[var(--nx-border)]/50 pt-4">
                   <span className="uppercase">Historical 60M</span>
                   <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[var(--nx-blue-primary)] rounded-full animate-pulse" />
                      <span className="text-white font-bold">AVG: 42ms</span>
                   </div>
                 </div>
              </Panel>
           </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant: 'critical' | 'active' | 'mesh' | 'info';
}

const MetricCard = ({ label, value, icon, variant }: MetricCardProps) => {
  const styles = {
    critical: 'border-[var(--nx-red-primary)]/20 bg-[var(--nx-red-dim)] text-[var(--nx-red-primary)]',
    active: 'border-[var(--nx-green-primary)]/20 bg-[var(--nx-green-dim)] text-[var(--nx-green-primary)]',
    mesh: 'border-[var(--nx-blue-primary)]/20 bg-[var(--nx-blue-dim)] text-[var(--nx-blue-primary)]',
    info: 'border-[var(--nx-teal-primary)]/20 bg-[var(--nx-teal-dim)] text-[var(--nx-teal-primary)]'
  };

  return (
    <div className={`p-6 nexus-card border ${styles[variant as keyof typeof styles]} flex items-center justify-between`}>
       <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">{label}</p>
          <p className="text-3xl font-black text-white tracking-tight">{value}</p>
       </div>
       <div className="opacity-40">{icon}</div>
    </div>
  );
};

const MapPin = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
