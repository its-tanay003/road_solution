import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Eye, Heart, LifeBuoy, Fingerprint, Cpu } from 'lucide-react';
import { useAIAssistantStore, AgentStatus } from '../../store/aiAssistantStore';

const AGENTS = [
  { id: 'triage', name: 'Triage', icon: Activity },
  { id: 'vision', name: 'Vision', icon: Eye },
  { id: 'vitals', name: 'Vitals', icon: Heart },
  { id: 'firstAid', name: 'First Aid', icon: LifeBuoy },
  { id: 'identity', name: 'Identity', icon: Fingerprint },
  { id: 'orchestrator', name: 'Brain', icon: Cpu },
];

export const AgentStatusRow: React.FC = () => {
  const { agentStatuses } = useAIAssistantStore();

  const isAnyActive = Object.values(agentStatuses).some(status => status !== 'idle');

  if (!isAnyActive) return null;

  return (
    <div className="h-12 bg-slate-900/80 border-y border-slate-800 flex items-center px-4 overflow-x-auto no-scrollbar gap-3">
      <AnimatePresence>
        {AGENTS.map((agent) => {
          const status = agentStatuses[agent.id] || 'idle';
          const Icon = agent.icon;
          
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.9, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                status === 'running' 
                  ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20' 
                  : status === 'done'
                  ? 'bg-green-500/10 border-green-500/30'
                  : status === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-slate-800/50 border-slate-700/30'
              }`}
            >
              <Icon size={14} className={status === 'running' ? 'text-amber-400' : 'text-gray-400'} />
              <span className={`text-[10px] font-medium tracking-wide uppercase ${
                status === 'running' ? 'text-amber-200' : 'text-gray-300'
              }`}>
                {agent.name}
              </span>
              <div className="relative flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  status === 'running' ? 'bg-amber-500 animate-pulse' :
                  status === 'done' ? 'bg-green-500' :
                  status === 'error' ? 'bg-red-500' : 'bg-gray-600'
                }`} />
                {status === 'running' && (
                  <div className="absolute w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-20" />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
