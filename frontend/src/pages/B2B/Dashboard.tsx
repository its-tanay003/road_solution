import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Activity, 
  Clock, 
  Map as MapIcon, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  BarChart3,
  Download
} from 'lucide-react';
import { TiltCard } from '../../components/TiltCard';
import { LiveMap } from '../LiveMap';

interface Incident {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  location: string;
  eta: string;
  patientStatus: string;
  timestamp: string;
}

export const B2BDashboard = () => {
  const [incidents] = useState<Incident[]>([
    { id: '1', type: 'Vehicle Collision', severity: 'CRITICAL', location: 'New Delhi, Sector 12', eta: '4 mins', patientStatus: 'Unconscious', timestamp: '2 mins ago' },
    { id: '2', type: 'Medical Emergency', severity: 'HIGH', location: 'Mumbai, Andheri West', eta: '8 mins', patientStatus: 'Respiratory Distress', timestamp: '5 mins ago' },
    { id: '3', type: 'Minor Accident', severity: 'LOW', location: 'Bangalore, Koramangala', eta: '12 mins', patientStatus: 'Stable', timestamp: '10 mins ago' },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 pt-24">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Building2 className="text-cyan-400" size={32} />
            Institutional <span className="text-cyan-400">Command Center</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1 uppercase tracking-widest">Hospital & Responder Network Hub</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Filter size={16} /> Filter View
          </button>
          <button className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active SOS', value: '12', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Avg Response', value: '6m 42s', icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'En-route', value: '08', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Total Resolved', value: '1,284', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <TiltCard key={i} className={`p-6 border border-white/5 ${stat.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon size={32} className={stat.color} />
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Main Layout: Split Pane */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Incident Queue */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Users className="text-cyan-400" size={18} />
              Incoming Patient Stream
            </h2>
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">LIVE</span>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {incidents.map((incident) => (
              <motion.div 
                key={incident.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all cursor-pointer group ${incident.severity === 'CRITICAL' ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 
                    incident.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {incident.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{incident.timestamp}</span>
                </div>
                <h3 className="font-bold text-white text-lg">{incident.type}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapIcon size={12} /> {incident.location}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-mono">ETA</p>
                      <p className="text-sm font-bold text-cyan-400">{incident.eta}</p>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-mono">Status</p>
                      <p className="text-sm font-bold text-slate-300">{incident.patientStatus}</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-600 group-hover:text-cyan-400 transition-colors" size={18} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Live Command Map & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md h-[450px] overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 space-y-2">
              <div className="bg-slate-950/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Network Healthy
              </div>
            </div>
            <LiveMap />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                    <BarChart3 className="text-cyan-400" size={18} />
                    Resource Allocation
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Ambulances', used: 6, total: 10, color: 'bg-cyan-500' },
                      { label: 'Trauma Units', used: 4, total: 5, color: 'bg-red-500' },
                      { label: 'First Responders', used: 22, total: 30, color: 'bg-amber-500' },
                    ].map((res, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] uppercase font-mono text-slate-400 mb-1">
                          <span>{res.label}</span>
                          <span>{res.used}/{res.total}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(res.used / res.total) * 100}%` }}
                            className={`h-full ${res.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/50">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Activity className="text-cyan-400" size={18} />
                  System Latency (SLA)
                </h3>
                <div className="h-24 flex items-end gap-1">
                  {[40, 60, 30, 80, 50, 40, 90, 20, 60, 70, 40, 30].map((v, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${v}%` }}
                      className="flex-1 bg-cyan-500/20 hover:bg-cyan-500 transition-colors rounded-t-sm"
                    />
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] font-mono uppercase text-slate-500">
                  <span>Last 60 Minutes</span>
                  <span className="text-cyan-400">Avg: 42ms</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
