import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Stethoscope, 
  Globe2, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'CONNECTED' | 'SIMULATED';
  color: string;
  endpoint: string;
  type: 'Gov' | 'EMS' | 'Health';
}

interface IntegrationEvent {
  id: string;
  source: string;
  message: string;
  time: string;
  type: 'Gov' | 'EMS' | 'Health';
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'irad',
    name: 'iRAD (MoRTH)',
    description: 'Integrated Road Accident Database (MoRTH India) integration for historical risk modeling.',
    icon: <ShieldCheck className="w-6 h-6" />,
    status: 'SIMULATED',
    color: 'blue',
    endpoint: '/api/integrations/irad/incidents',
    type: 'Gov'
  },
  {
    id: 'cad',
    name: '911 CAD Dispatch',
    description: 'Computer-Aided Dispatch orchestration for PSAP (Public Safety Answering Point) relay.',
    icon: <Activity className="w-6 h-6" />,
    status: 'CONNECTED',
    color: 'amber',
    endpoint: '/api/integrations/cad/dispatch',
    type: 'EMS'
  },
  {
    id: 'who',
    name: 'WHO Registry',
    description: 'ICD-10-CM global road safety database reporting for longitudinal impact tracking.',
    icon: <Globe2 className="w-6 h-6" />,
    status: 'SIMULATED',
    color: 'purple',
    endpoint: '/api/integrations/who/report',
    type: 'Health'
  },
  {
    id: 'blockchain',
    name: 'Blockchain Audit',
    description: 'Immutable, cryptographically sealed ledger for all incident actions and agency handshakes.',
    icon: <ShieldCheck className="w-6 h-6" />,
    status: 'CONNECTED',
    color: 'emerald',
    endpoint: '/audit',
    type: 'Gov'
  },
  {
    id: 'hospital',
    name: 'Hospital HIE',
    description: 'Health Information Exchange for real-time trauma bed availability and ER wait times.',
    icon: <Stethoscope className="w-6 h-6" />,
    status: 'CONNECTED',
    color: 'emerald',
    endpoint: '/api/integrations/hospital/availability',
    type: 'Health'
  }
];

export const IntegrationsPanel: React.FC = () => {
  const getMockMessage = (id: string) => {
    switch(id) {
      case 'irad': return 'Pulled 12 regional crash records from MoRTH';
      case 'cad': return 'Assigned Ticket #CAD-482910 to ALS-2';
      case 'who': return 'Reported incident SOS-789 (ICD-10)';
      case 'hospital': return 'Trauma Bay 1 confirmed available';
      default: return 'Data synchronization active';
    }
  };

  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());

  // Mock live event feed
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIntegration = INTEGRATIONS[Math.floor(Math.random() * INTEGRATIONS.length)];
      const newEvent: IntegrationEvent = {
        id: Math.random().toString(36).substr(2, 9),
        source: randomIntegration.name,
        message: getMockMessage(randomIntegration.id),
        time: new Date().toLocaleTimeString(),
        type: randomIntegration.type
      };
      
      setEvents(prev => [newEvent, ...prev].slice(0, 5));
      setLastSync(new Date().toLocaleTimeString());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center font-sans overflow-hidden">
      <div className="max-w-6xl w-full space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Cpu className="text-blue-400 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Agency Integrations</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              ROADSoS acts as a central interoperability hub, connecting civilian emergency signals to established government and institutional response protocols.
            </p>
          </div>
          
          <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sync Status</span>
              <span className="text-xs font-bold text-emerald-400">OPERATIONAL</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
              <Activity className="text-emerald-500 w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INTEGRATIONS.map((integration) => (
            <motion.div 
              key={integration.id}
              whileHover={{ y: -4 }}
              className="group relative bg-slate-900/50 border border-white/5 p-6 rounded-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-${integration.color}-500/10 text-${integration.color}-400 border border-${integration.color}-500/20 shadow-lg shadow-${integration.color}-500/5`}>
                  {integration.icon}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                  integration.status === 'CONNECTED' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-slate-800 text-slate-400 border border-white/5'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${integration.status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {integration.status}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{integration.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{integration.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <Clock size={12} />
                    Last sync: {lastSync}
                  </div>
                  <button 
                    title="View integration details"
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Event Feed */}
        <div className="bg-slate-900/80 border border-white/10 rounded-4xl overflow-hidden shadow-2xl">
          <div className="bg-white/5 p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Interoperability Feed</span>
            </div>
            <span className="text-[8px] font-mono text-slate-500">FORMAT: ISO-8601 / JSON-API</span>
          </div>
          
          <div className="p-6 space-y-4 min-h-[300px]">
            <AnimatePresence initial={false}>
              {events.map((event) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5"
                >
                  <div className="text-[10px] font-mono text-slate-600 w-20">{event.time}</div>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    event.type === 'Gov' ? 'bg-blue-500/10 text-blue-400' :
                    event.type === 'EMS' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {event.type}
                  </div>
                  <div className="text-xs font-bold text-slate-300 flex-1">{event.source}</div>
                  <div className="text-xs font-medium text-slate-500">{event.message}</div>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {events.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 py-12">
                <Activity className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">Initializing Handshakes...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footnote */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div className="h-px bg-white/5 flex-1" />
          <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-full border border-white/5 shadow-xl">
            <AlertCircle size={14} className="text-blue-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Note: In production environments, these connectors bridge to authenticated <span className="text-white">GovCloud</span> API Gateways.
            </p>
          </div>
          <div className="h-px bg-white/5 flex-1" />
        </div>

      </div>
    </div>
  );
};
