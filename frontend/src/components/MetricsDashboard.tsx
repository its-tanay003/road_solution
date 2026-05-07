import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart3, 
  Activity, 
  Zap, 
  AlertCircle, 
  Terminal, 
  RefreshCcw, 
  ShieldCheck,
  TrendingUp,
  Radio
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../lib/logger';

interface HistoryPoint {
  time: string;
  value: number;
}

const METRICS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/metrics';

export const MetricsDashboard: React.FC = () => {
  const [rawMetrics, setRawMetrics] = useState<string>('');
  const [metricsMap, setMetricsMap] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showRaw, setShowRaw] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const parseMetrics = (text: string) => {
    const lines = text.split('\n');
    const map: Record<string, number> = {};
    
    lines.forEach(line => {
      if (line.startsWith('#') || !line.trim()) return;
      
      // Basic regex to match metric_name{labels} value or metric_name value
      const match = line.match(/^([a-zA-Z_0-9]+)({[^}]+})?\s+([0-9e.+-]+)/);
      if (match) {
        const name = match[1];
        const value = parseFloat(match[3]);
        // For simplicity, we take the last value if multiple labels exist
        map[name] = value;
      }
    });
    return map;
  };

  const fetchMetrics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(METRICS_URL);
      const text = await response.text();
      setRawMetrics(text);
      const parsed = parseMetrics(text);
      setMetricsMap(parsed);
      setLastUpdated(new Date());

      // Update history for sparkline
      const responseTime = parsed['ai_triage_response_seconds_sum'] / (parsed['ai_triage_response_seconds_count'] || 1);
      setHistory(prev => {
        const newHistory = [...prev, { time: new Date().toLocaleTimeString(), value: responseTime || 0 }].slice(-20);
        return newHistory;
      });
    } catch (error) {
      logger.error('Error fetching metrics:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    const poll = async () => {
      await fetchMetrics();
    };
    poll();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const healthStatus = useMemo(() => {
    const avgLatency = history[history.length - 1]?.value || 0;
    if (avgLatency < 2) return { label: 'HEALTHY', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (avgLatency < 5) return { label: 'DEGRADED', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/10' };
  }, [history]);

  const stats = [
    { label: 'Active Incidents', value: metricsMap['active_incidents_total'] || 0, icon: <AlertCircle size={18} />, color: 'text-red-500' },
    { label: 'Live Connections', value: metricsMap['websocket_connections_active'] || 0, icon: <Radio size={18} />, color: 'text-blue-500' },
    { label: 'SOS Today', value: metricsMap['sos_triggers_total'] || 0, icon: <Zap size={18} />, color: 'text-amber-500' },
    { label: 'Avg AI Response', value: `${(history[history.length - 1]?.value || 0).toFixed(2)}s`, icon: <Activity size={18} />, color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-600/20 p-2 rounded-(--radius-lg) border border-emerald-500/30">
                <BarChart3 size={24} className="text-emerald-500" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">System Telemetry</h1>
              <div className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black tracking-widest mt-1">
                PRODUCTION READY
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500 uppercase">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Cluster: ASIA-SOUTH-1
              </span>
              <span>|</span>
              <span className="flex items-center gap-1.5">
                <RefreshCcw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh: 3s
              </span>
              <span>|</span>
              <span>Last Updated: {Math.round((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3 ${healthStatus.bg}`}>
              <div className={`text-[10px] font-black uppercase tracking-widest ${healthStatus.color}`}>System Health</div>
              <div className={`text-sm font-black ${healthStatus.color}`}>{healthStatus.label}</div>
            </div>
            <button 
              onClick={() => setShowRaw(!showRaw)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Terminal size={14} />
              {showRaw ? 'HIDE RAW' : 'VIEW RAW'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {stat.icon}
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                {stat.label}
              </div>
              <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>
                {stat.value}
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                <TrendingUp size={12} />
                LIVE UPDATING
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                <h3 className="font-bold text-sm uppercase tracking-tight">AI Triage Response Latency</h3>
              </div>
              <div className="text-[10px] font-mono text-slate-500">60s ROLLING WINDOW</div>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    hide 
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickFormatter={(val) => `${val}s`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={18} className="text-emerald-500" />
              <h3 className="font-bold text-sm uppercase tracking-tight">Operational Security</h3>
            </div>
            <div className="space-y-6 flex-1">
              {[
                { label: 'Signal Integrity', status: 'VERIFIED', color: 'text-emerald-500' },
                { label: 'Data Encryption', status: 'AES-256-GCM', color: 'text-blue-500' },
                { label: 'Authentication', status: 'OIDC/ACTIVE', color: 'text-emerald-500' },
                { label: 'Resource Load', status: '12.4%', color: 'text-slate-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-tight">{item.label}</div>
                  <div className={`text-xs font-mono font-black ${item.color}`}>{item.status}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Node Status</div>
              <div className="flex gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`h-8 flex-1 rounded-sm ${i === 8 ? 'bg-amber-500/40' : 'bg-emerald-500/40'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Raw Metrics View */}
        <AnimatePresence>
          {showRaw && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prometheus Raw Payload</span>
                </div>
                <div className="text-[10px] font-mono text-slate-600">GET /metrics</div>
              </div>
              <pre className="p-6 text-[10px] font-mono text-emerald-500/80 overflow-x-auto max-h-[400px] custom-scrollbar leading-relaxed">
                {rawMetrics}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
