import { ShieldAlert, Info, TrendingUp, AlertTriangle, Car } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Mock MoRTH Data
const ACCIDENT_TRENDS = [
  { month: 'Jan', '2025': 4200, '2026': 3800 },
  { month: 'Feb', '2025': 3900, '2026': 3400 },
  { month: 'Mar', '2025': 4100, '2026': 3550 },
  { month: 'Apr', '2025': 4400, '2026': 3900 },
  { month: 'May', '2025': 4600, '2026': 4100 },
  { month: 'Jun', '2025': 4800, '2026': 4250 },
];

const VEHICLE_DATA = [
  { name: 'Two-Wheelers', count: 45, color: '#D32F2F' }, 
  { name: 'Cars', count: 25, color: '#F57C00' }, 
  { name: 'Trucks', count: 20, color: '#0D1B2A' }, 
  { name: 'Buses/Others', count: 10, color: '#388E3C' }, 
];

export const IndiaStats = () => {
  return (
    <div className="p-6 space-y-10 max-w-4xl mx-auto pb-32">
      <header className="flex flex-col gap-2 pt-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldAlert size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none text-(--app-text)">SAFETY STATS</h1>
            <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">Live MoRTH iRAD Data</p>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Saved Lives', value: '3,842', trend: '+12%', icon: TrendingUp, color: 'text-safe', bg: 'bg-safe/10' },
          { label: 'Active Alerts', value: '1,204', trend: 'Requires Action', icon: AlertTriangle, color: 'text-emergency', bg: 'bg-emergency/10' },
          { label: 'Safety Nodes', value: '842', trend: 'Network Active', icon: ShieldAlert, color: 'text-navy', bg: 'bg-navy/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-(--app-surface) p-8 rounded-[2.5rem] border-4 border-(--app-border) shadow-xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all`}>
              <stat.icon size={64} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-2">{stat.label}</p>
            <div className="text-4xl font-black text-(--app-text) tracking-tighter">{stat.value}</div>
            <div className={`mt-4 inline-flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${stat.bg} ${stat.color}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-10">
        {/* Line Chart */}
        <div className="bg-(--app-surface) p-8 rounded-[3rem] border-4 border-(--app-border) shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-(--app-text) uppercase tracking-tight">Accident Trends</h2>
            <TrendingUp className="text-navy" size={32} />
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ACCIDENT_TRENDS}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="currentColor" 
                  tick={{ fontSize: 14, fontWeight: 900 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="currentColor" 
                  tick={{ fontSize: 14, fontWeight: 900 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '4px solid var(--app-border)',
                    backgroundColor: 'var(--app-surface)',
                    fontWeight: 900,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="2025" 
                  stroke="#94a3b8" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#94a3b8' }} 
                  name="2025" 
                />
                <Line 
                  type="monotone" 
                  dataKey="2026" 
                  stroke="#D32F2F" 
                  strokeWidth={6} 
                  dot={{ r: 8, fill: '#D32F2F' }} 
                  name="2026 (Active)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-(--app-surface) p-8 rounded-[3rem] border-4 border-(--app-border) shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-(--app-text) uppercase tracking-tight">Vehicle Impact</h2>
            <Car className="text-amber" size={32} />
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VEHICLE_DATA} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="currentColor" 
                  tick={{ fontSize: 14, fontWeight: 900 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '4px solid var(--app-border)',
                    backgroundColor: 'var(--app-surface)',
                    fontWeight: 900
                  }}
                />
                <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={40}>
                  {VEHICLE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-navy/5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest opacity-60">
              <Info size={16} /> 
              Sourced from iRAD Database • 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
