'use client';

export const dynamic = 'force-dynamic';


import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeIncidents } from '@/lib/supabase/realtime';
import type { DBIncident } from '@/lib/supabase/types';
import {
  AlertTriangle, CheckCircle2, Clock, Radio, RefreshCw,
  Wifi, WifiOff, MapPin, Phone, X, ChevronRight,
  Activity, Users, ShieldCheck, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── helpers ────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const STATUS_CONFIG: Record<DBIncident['status'], { label: string; color: string; dot: string; icon: React.ElementType }> = {
  active:       { label: 'Active',       color: 'text-red-400',    dot: 'bg-red-500',    icon: AlertTriangle },
  acknowledged: { label: 'Acknowledged', color: 'text-yellow-400', dot: 'bg-yellow-400', icon: Clock },
  resolved:     { label: 'Resolved',     color: 'text-green-400',  dot: 'bg-green-500',  icon: CheckCircle2 },
  false_alarm:  { label: 'False Alarm',  color: 'text-gray-400',   dot: 'bg-gray-600',   icon: X },
};

const TYPE_EMOJI: Record<string, string> = {
  road_crash: '🚗', medical: '🏥', fire: '🔥', flood: '🌊', assault: '🚨', other: '⚠️',
};

// Mock stats for demo (replace with real Supabase aggregates)
const MOCK_STATS = [
  { label: 'Active',     value: '—', icon: Zap,        color: 'text-red-400',    bg: 'bg-red-500/10' },
  { label: 'Today',      value: '—', icon: Activity,   color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { label: 'Responders', value: '4', icon: Users,       color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  { label: 'Resolved',   value: '—', icon: ShieldCheck, color: 'text-green-400',  bg: 'bg-green-500/10' },
];

// ── Component ──────────────────────────────────────────────────
export default function AdminPage() {
  const { incidents, connectionStatus, error, updateIncidentStatus, refresh } = useRealtimeIncidents({ limit: 100 });
  const [selected, setSelected] = useState<DBIncident | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<DBIncident['status'] | 'all'>('all');

  const activeCount  = incidents.filter(i => i.status === 'active').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;
  const todayCount   = incidents.filter(i => new Date(i.created_at).toDateString() === new Date().toDateString()).length;

  const stats = MOCK_STATS.map(s => ({
    ...s,
    value: s.label === 'Active' ? String(activeCount) : s.label === 'Today' ? String(todayCount) : s.label === 'Resolved' ? String(resolvedCount) : s.value,
  }));

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter);

  async function handleStatusChange(incident: DBIncident, newStatus: DBIncident['status']) {
    setUpdating(incident.id);
    try {
      await updateIncidentStatus(incident.id, newStatus);
      if (selected?.id === incident.id) setSelected({ ...incident, status: newStatus });
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
            <Radio size={15} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-base text-white leading-none">Control Room</h1>
            <p className="text-gray-500 text-[10px]">ROADSoS Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
            connectionStatus === 'connected' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
            connectionStatus === 'error'     ? 'bg-red-500/10 border-red-500/30 text-red-400' :
            'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          )}>
            {connectionStatus === 'connected'
              ? <><Wifi size={11} /> Live</>
              : connectionStatus === 'error'
              ? <><WifiOff size={11} /> Error</>
              : <><WifiOff size={11} /> Connecting</>
            }
          </div>
          <button onClick={refresh} aria-label="Refresh incidents"
            className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
            <RefreshCw size={14} className="text-gray-400" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 pb-10">
        {/* Error banner */}
        {error && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-2 text-yellow-300 text-sm flex items-center gap-2">
            <AlertTriangle size={14} />
            {error} — showing cached data
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={cn('rounded-2xl p-3 border border-gray-800', s.bg)}>
                <Icon size={16} className={cn('mb-1', s.color)} />
                <p className={cn('text-xl font-black', s.color)}>{s.value}</p>
                <p className="text-gray-500 text-[10px]">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'active', 'acknowledged', 'resolved', 'false_alarm'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                filter === f ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              )}>
              {f === 'all' ? 'All' : f === 'false_alarm' ? 'False Alarm' : STATUS_CONFIG[f].label}
              {f === 'active' && activeCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white rounded-full text-[9px] px-1.5 py-0.5">{activeCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Incident list + detail panel */}
        <div className="flex gap-3">
          {/* List */}
          <div className="flex-1 space-y-2 min-w-0">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <CheckCircle2 size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No {filter !== 'all' ? filter : ''} incidents</p>
                <p className="text-xs mt-1">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')
                    ? 'Configure Supabase in .env.local to see real incidents'
                    : 'All clear'}
                </p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {filtered.map((inc) => {
                const cfg = STATUS_CONFIG[inc.status];
                const Icon = cfg.icon;
                const isSelected = selected?.id === inc.id;
                return (
                  <motion.button
                    key={inc.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => setSelected(isSelected ? null : inc)}
                    className={cn(
                      'w-full text-left bg-gray-900 border rounded-2xl p-4 transition-all',
                      isSelected ? 'border-red-500/50 bg-gray-800' : 'border-gray-800 hover:border-gray-700'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative mt-0.5">
                        <span className="text-xl">{TYPE_EMOJI[inc.incident_type] ?? '⚠️'}</span>
                        {inc.status === 'active' && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-gray-900 animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white capitalize">{inc.incident_type.replace('_', ' ')}</span>
                          <span className={cn('flex items-center gap-1 text-xs font-semibold', cfg.color)}>
                            <Icon size={11} />{cfg.label}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{inc.address ?? `${inc.lat?.toFixed(4)}, ${inc.lng?.toFixed(4)}`}</p>
                        <p className="text-gray-600 text-[10px] mt-1">{timeAgo(inc.created_at)} · ID {inc.id.slice(0, 8)}</p>
                      </div>
                      <ChevronRight size={14} className={cn('text-gray-600 shrink-0 transition-transform mt-1', isSelected && 'rotate-90')} />
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.aside
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 280 }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                className="shrink-0 bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-hidden"
                style={{ minWidth: 240, maxWidth: 300 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-sm text-white">Incident Detail</p>
                  <button onClick={() => setSelected(null)} aria-label="Close detail panel"
                    className="w-7 h-7 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700">
                    <X size={13} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <Row label="ID" value={selected.id.slice(0, 12) + '…'} />
                  <Row label="Type" value={selected.incident_type.replace('_', ' ')} />
                  <Row label="Status" value={STATUS_CONFIG[selected.status].label} valueClass={STATUS_CONFIG[selected.status].color} />
                  {selected.address && <Row label="Address" value={selected.address} />}
                  {selected.lat && <Row label="Coords" value={`${selected.lat.toFixed(5)}, ${selected.lng?.toFixed(5)}`} />}
                  {selected.battery_level != null && <Row label="Battery" value={`${selected.battery_level}%`} />}
                  {selected.responder_eta_minutes != null && <Row label="ETA" value={`${selected.responder_eta_minutes} min`} />}
                  <Row label="Created" value={new Date(selected.created_at).toLocaleTimeString()} />
                </div>

                {/* Quick actions */}
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Update Status</p>
                  {(['acknowledged', 'resolved', 'false_alarm'] as const)
                    .filter(s => s !== selected.status)
                    .map(s => {
                      const cfg = STATUS_CONFIG[s];
                      const Icon = cfg.icon;
                      return (
                        <button key={s}
                          disabled={updating === selected.id}
                          onClick={() => void handleStatusChange(selected, s)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
                            'bg-gray-800 border-gray-700 hover:border-gray-500 text-white',
                            updating === selected.id && 'opacity-50 cursor-wait'
                          )}
                        >
                          <Icon size={12} className={cfg.color} /> Mark {cfg.label}
                        </button>
                      );
                    })}
                  {/* Call & Navigate */}
                  <div className="flex gap-2 mt-3">
                    <a href="tel:112" aria-label="Call 112 emergency"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold">
                      <Phone size={12} /> 112
                    </a>
                    {selected.lat && (
                      <a href={`https://maps.google.com/?q=${selected.lat},${selected.lng}`}
                        target="_blank" rel="noreferrer" aria-label="Open location in Google Maps"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                        <MapPin size={12} /> Map
                      </a>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = 'text-white' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={cn('text-right break-all', valueClass)}>{value}</span>
    </div>
  );
}
