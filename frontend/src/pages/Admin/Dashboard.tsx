import { useState } from 'react';
import { 
  ShieldCheck, Activity, Users, MapPin, 
  AlertTriangle, Clock, Radio, BarChart3, 
  Terminal, Zap, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard = () => {
  const [stats] = useState({
    totalServices: 142,
    activeSos: 3,
    pendingFlags: 12,
    meshNodes: 124,
    avgResponseTime: "4:32"
  });

  const [activeIncidents] = useState([
    { id: 'SOS-912', location: 'New Delhi, Area 5', severity: 'CRITICAL', time: '2m ago', telemetry: { speed: '0km/h', gForce: '4.2g' } },
    { id: 'SOS-884', location: 'Gurgaon, Sector 44', severity: 'MODERATE', time: '12m ago', telemetry: { speed: '12km/h', gForce: '0.8g' } },
  ]);

  return (
    <div className="min-h-screen bg-navy text-white font-sans selection:bg-emergency selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emergency/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-safe/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Glass Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-navy/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-emergency/20 rounded-lg border border-emergency/30">
            <ShieldCheck className="text-emergency" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-condensed font-bold tracking-tighter uppercase">
              ROADSoS <span className="text-emergency">COMMAND</span>
            </h1>
            <div className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 bg-safe rounded-full animate-pulse"></div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Global Ops Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-4 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <div className="flex items-center space-x-2 border-r border-white/10 pr-4">
              <Globe size={14} className="text-safe" />
              <span className="text-xs font-mono">ASIA-SOUTH-1</span>
            </div>
            <div className="flex items-center space-x-2">
              <Terminal size={14} className="text-muted" />
              <span className="text-xs font-mono uppercase">V2.4.0-STABLE</span>
            </div>
          </div>
          <button className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all">
            Logout
          </button>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard title="ACTIVE SOS" value={stats.activeSos} icon={<AlertTriangle />} color="emergency" />
          <MetricCard title="AVG RESPONSE" value={stats.avgResponseTime} icon={<Clock />} color="safe" />
          <MetricCard title="MESH NODES" value={stats.meshNodes} icon={<Radio />} color="blue" />
          <MetricCard title="COMMUNITY" value="1,204" icon={<Users />} color="purple" />
          <MetricCard title="INTELLIGENCE" value="98%" icon={<Zap />} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Incidents */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center">
                  <Activity size={20} className="mr-2 text-emergency" />
                  LIVE INCIDENT STREAM
                </h2>
                <div className="px-3 py-1 bg-emergency/10 border border-emergency/20 rounded text-[10px] font-bold text-emergency animate-pulse">
                  HIGH PRIORITY MONITORING
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {activeIncidents.map((incident) => (
                    <motion.div 
                      key={incident.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 border border-white/5 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${incident.severity === 'CRITICAL' ? 'bg-emergency/20 text-emergency' : 'bg-amber-500/20 text-amber-500'}`}>
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold">{incident.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${incident.severity === 'CRITICAL' ? 'bg-emergency text-white' : 'bg-amber-500 text-black'}`}>
                              {incident.severity}
                            </span>
                          </div>
                          <p className="text-sm text-muted flex items-center mt-1">
                            <MapPin size={12} className="mr-1" /> {incident.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8">
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[10px] font-mono text-muted uppercase">Telemetry</span>
                          <span className="text-xs font-bold text-safe">{incident.telemetry.speed} | {incident.telemetry.gForce}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono text-muted uppercase">Duration</span>
                          <span className="text-xs font-bold">{incident.time}</span>
                        </div>
                        <button 
                          aria-label="Zap Alert"
                          title="Zap Alert"
                          className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Zap size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Simulated Heatmap Placeholder */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 opacity-20 grayscale invert">
                 <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" alt="Map" className="w-full h-full object-cover" />
               </div>
               <div className="z-10 text-center">
                 <Globe className="mx-auto mb-4 text-safe/50 animate-spin-slow" size={48} />
                 <h3 className="font-bold">GEOSPATIAL RISK HEATMAP</h3>
                 <p className="text-xs text-muted max-w-xs mt-2">Aggregating live sensor data from {stats.meshNodes} active mesh nodes.</p>
               </div>
            </div>
          </div>

          {/* Right Column: Services & Network */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <Radio size={20} className="mr-2 text-blue-400" />
                NETWORK STATUS
              </h2>
              <div className="space-y-4">
                 <StatusRow label="Cloud Signaling" status="Operational" color="safe" />
                 <StatusRow label="P2P Mesh Network" status="124 Nodes" color="safe" />
                 <StatusRow label="SMS Fallback Gateway" status="Standby" color="blue" />
                 <StatusRow label="AI Triage Engine" status="Online" color="safe" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">TOP RESPONDERS</h2>
                <BarChart3 size={18} className="text-muted" />
              </div>
              <div className="space-y-3">
                <ResponderItem name="Delhi Trauma Center" type="Hospital" rating="4.9" />
                <ResponderItem name="Rapid Unit 102" type="Ambulance" rating="4.8" />
                <ResponderItem name="HQ Police Dispatch" type="Police" rating="5.0" />
              </div>
              <button className="w-full mt-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                Manage Directory
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color }: any) => {
  const colors: any = {
    emergency: 'text-emergency bg-emergency/10 border-emergency/20',
    safe: 'text-safe bg-safe/10 border-safe/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} backdrop-blur-md`}>
      <div className="flex items-center justify-between mb-2 opacity-80">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-condensed font-bold">{value}</div>
    </div>
  );
};

const StatusRow = ({ label, status, color }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
    <span className="text-sm text-muted">{label}</span>
    <div className="flex items-center space-x-2">
      <div className={`h-1.5 w-1.5 rounded-full ${color === 'safe' ? 'bg-safe' : 'bg-blue-400'}`}></div>
      <span className="text-xs font-mono font-bold">{status}</span>
    </div>
  </div>
);

const ResponderItem = ({ name, type, rating }: any) => (
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
    <div>
      <div className="text-sm font-bold">{name}</div>
      <div className="text-[10px] text-muted uppercase">{type}</div>
    </div>
    <div className="flex items-center space-x-1">
      <Zap size={10} className="text-amber-400" />
      <span className="text-xs font-bold">{rating}</span>
    </div>
  </div>
);
