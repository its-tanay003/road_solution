'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle2, Clock, MapPin,
  Phone, Radio, RefreshCw, Wifi, WifiOff, Users, Activity,
  Navigation, Zap, ChevronRight, X, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type IncidentStatus = 'active' | 'acknowledged' | 'resolved' | 'false_alarm';

interface Incident {
  id: string;
  lat: number;
  lng: number;
  address: string;
  status: IncidentStatus;
  trigger: 'manual' | 'triple-press' | 'voice' | 'sensor';
  createdAt: Date;
  updatedAt: Date;
  responderEta?: number;
  responderName?: string;
  userId?: string;
  notes?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    lat: 28.6139, lng: 77.2090,
    address: 'Connaught Place, New Delhi, India',
    status: 'active',
    trigger: 'manual',
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 1000),
    responderEta: 4,
    responderName: 'Unit Alpha-7',
  },
  {
    id: 'INC-002',
    lat: 19.0760, lng: 72.8777,
    address: 'Bandra West, Mumbai, Maharashtra',
    status: 'acknowledged',
    trigger: 'sensor',
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    responderEta: 2,
    responderName: 'Unit Bravo-3',
  },
  {
    id: 'INC-003',
    lat: 12.9716, lng: 77.5946,
    address: 'Koramangala, Bangalore, Karnataka',
    status: 'resolved',
    trigger: 'triple-press',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000),
    responderName: 'Unit Charlie-1',
    notes: 'Minor road accident — occupants safe',
  },
  {
    id: 'INC-004',
    lat: 22.5726, lng: 88.3639,
    address: 'Park Street, Kolkata, West Bengal',
    status: 'false_alarm',
    trigger: 'voice',
    createdAt: new Date(Date.now() - 90 * 60 * 1000),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000),
    notes: 'Accidental activation — confirmed by user',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: 'ACTIVE', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-700' },
  acknowledged: { label: 'ACKNOWLEDGED', color: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-700' },
  resolved: { label: 'RESOLVED', color: 'text-green-400', bg: 'bg-green-950/50', border: 'border-green-700' },
  false_alarm: { label: 'FALSE ALARM', color: 'text-gray-400', bg: 'bg-gray-900/50', border: 'border-gray-700' },
};

const TRIGGER_ICONS: Record<Incident['trigger'], string> = {
  manual: '👆',
  'triple-press': '3️⃣',
  voice: '🎙️',
  sensor: '📡',
};

function elapsed(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
        <p className="text-gray-500 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Incident Card ────────────────────────────────────────────────────────────

function IncidentCard({
  incident,
  onSelect,
  selected,
}: {
  incident: Incident;
  onSelect: (i: Incident) => void;
  selected: boolean;
}) {
  const cfg = STATUS_CONFIG[incident.status];
  return (
    <motion.button
      layout
      onClick={() => onSelect(incident)}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full text-left rounded-2xl border p-4 transition-all',
        cfg.bg, cfg.border,
        selected ? 'ring-2 ring-white/20' : 'hover:brightness-110',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black tracking-widest ${cfg.color}`}>{cfg.label}</span>
            <span className="text-gray-600 text-[10px]">{incident.id}</span>
            <span className="text-gray-600 text-[10px]">{TRIGGER_ICONS[incident.trigger]} {incident.trigger}</span>
          </div>
          <p className="text-white text-sm font-medium leading-tight truncate">{incident.address}</p>
          <p className="text-gray-500 text-xs mt-1">{elapsed(incident.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {incident.responderEta !== undefined && incident.status !== 'resolved' && (
            <span className="text-orange-400 text-xs font-bold">{incident.responderEta}m ETA</span>
          )}
          {incident.responderName && (
            <span className="text-gray-500 text-[10px]">{incident.responderName}</span>
          )}
          <ChevronRight size={14} className="text-gray-600 mt-1" />
        </div>
      </div>
    </motion.button>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ incident, onClose, onStatusChange }: {
  incident: Incident;
  onClose: () => void;
  onStatusChange: (id: string, status: IncidentStatus) => void;
}) {
  const cfg = STATUS_CONFIG[incident.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sticky top-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm">Incident Details</h3>
        <button
          onClick={onClose}
          aria-label="Close incident detail panel"
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Status badge */}
      <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-4 text-xs font-bold tracking-widest', cfg.bg, cfg.border, cfg.color)}>
        {incident.status === 'active' && (
          <motion.div className="w-2 h-2 rounded-full bg-red-500" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
        )}
        {cfg.label}
      </div>

      {/* Info rows */}
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-gray-500 mt-0.5 shrink-0" />
          <p className="text-gray-300">{incident.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-500 shrink-0" />
          <p className="text-gray-400">{incident.createdAt.toLocaleTimeString()} · {elapsed(incident.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-gray-500 shrink-0" />
          <p className="text-gray-400">Trigger: {TRIGGER_ICONS[incident.trigger]} {incident.trigger}</p>
        </div>
        {incident.responderName && (
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-gray-500 shrink-0" />
            <p className="text-gray-400">{incident.responderName}
              {incident.responderEta !== undefined && incident.status !== 'resolved' && (
                <span className="ml-2 text-orange-400 font-bold">{incident.responderEta}min ETA</span>
              )}
            </p>
          </div>
        )}
        {incident.notes && (
          <div className="flex items-start gap-2">
            <MessageSquare size={14} className="text-gray-500 mt-0.5 shrink-0" />
            <p className="text-gray-400 italic">{incident.notes}</p>
          </div>
        )}
      </div>

      {/* Maps link */}
      <a
        href={`https://maps.google.com/?q=${incident.lat},${incident.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-2 w-full bg-blue-900/30 border border-blue-800 text-blue-300 rounded-xl px-3 py-2 text-xs hover:bg-blue-900/50 transition-colors"
      >
        <Navigation size={13} />
        Open in Google Maps
      </a>

      {/* Action buttons */}
      {incident.status !== 'resolved' && incident.status !== 'false_alarm' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {incident.status === 'active' && (
            <button
              onClick={() => onStatusChange(incident.id, 'acknowledged')}
              className="col-span-2 bg-orange-900/40 border border-orange-700 text-orange-300 rounded-xl py-2 text-xs font-bold hover:bg-orange-900/60 transition-colors"
            >
              ✅ Acknowledge
            </button>
          )}
          <button
            onClick={() => onStatusChange(incident.id, 'resolved')}
            className="bg-green-900/40 border border-green-700 text-green-300 rounded-xl py-2 text-xs font-bold hover:bg-green-900/60 transition-colors"
          >
            ✓ Resolve
          </button>
          <button
            onClick={() => onStatusChange(incident.id, 'false_alarm')}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-xl py-2 text-xs font-bold hover:bg-gray-700 transition-colors"
          >
            False Alarm
          </button>
        </div>
      )}

      {/* Quick dial */}
      <div className="mt-4 flex gap-2">
        <a href="tel:100" className="flex-1 flex items-center justify-center gap-1.5 bg-blue-900/30 border border-blue-800 text-blue-300 rounded-xl py-2 text-xs hover:bg-blue-900/50 transition-colors">
          <Phone size={12} /> Police
        </a>
        <a href="tel:108" className="flex-1 flex items-center justify-center gap-1.5 bg-red-900/30 border border-red-800 text-red-300 rounded-xl py-2 text-xs hover:bg-red-900/50 transition-colors">
          <Phone size={12} /> Ambulance
        </a>
        <a href="tel:101" className="flex-1 flex items-center justify-center gap-1.5 bg-orange-900/30 border border-orange-800 text-orange-300 rounded-xl py-2 text-xs hover:bg-orange-900/50 transition-colors">
          <Phone size={12} /> Fire
        </a>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all');
  const [online, setOnline] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // Simulate ETA countdown
      setIncidents(prev => prev.map(inc =>
        inc.responderEta !== undefined && inc.responderEta > 0
          ? { ...inc, responderEta: inc.responderEta - 1, updatedAt: new Date() }
          : inc
      ));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = useCallback((id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status, updatedAt: new Date() } : inc));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  }, []);

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter);
  const activeCount = incidents.filter(i => i.status === 'active').length;
  const ackCount = incidents.filter(i => i.status === 'acknowledged').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  const FILTER_TABS: { key: IncidentStatus | 'all'; label: string }[] = [
    { key: 'all', label: `All (${incidents.length})` },
    { key: 'active', label: `🔴 Active (${activeCount})` },
    { key: 'acknowledged', label: `🟠 Acknowledged (${ackCount})` },
    { key: 'resolved', label: `🟢 Resolved (${resolvedCount})` },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm sticky top-0 z-10 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-sm tracking-tight">ROADSoS Control Room</h1>
            <p className="text-gray-500 text-[10px]">Admin Dashboard — Live Incident Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs ${online ? 'text-green-400' : 'text-red-400'}`}>
            {online ? <Wifi size={12} /> : <WifiOff size={12} />}
            {online ? 'Live' : 'Offline'}
          </span>
          <button
            onClick={() => setLastRefresh(new Date())}
            aria-label="Refresh incident feed"
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400"
          >
            <RefreshCw size={14} />
          </button>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to App
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Active Incidents" value={activeCount} icon={AlertTriangle} color="bg-red-900/50 text-red-400" />
          <StatCard label="Acknowledged" value={ackCount} icon={Radio} color="bg-orange-900/50 text-orange-400" />
          <StatCard label="Resolved Today" value={resolvedCount} icon={CheckCircle2} color="bg-green-900/50 text-green-400" />
          <StatCard label="Total Incidents" value={incidents.length} icon={Activity} color="bg-blue-900/50 text-blue-400" />
        </div>

        {/* Last refresh */}
        <p className="text-gray-600 text-xs mb-4 flex items-center gap-1.5">
          <Clock size={11} /> Last updated: {lastRefresh.toLocaleTimeString()}
        </p>

        {/* Active alert banner */}
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-red-950/60 border border-red-700 rounded-2xl px-4 py-3 mb-5"
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-red-500 shrink-0"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <p className="text-red-200 text-sm font-bold">
              {activeCount} active emergency{activeCount > 1 ? 's' : ''} — immediate attention required
            </p>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Incident list */}
          <div className="flex-1 min-w-0">
            {/* Filter tabs */}
            <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-4 overflow-x-auto no-scrollbar">
              {FILTER_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                    filter === key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cards */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.map(inc => (
                  <IncidentCard
                    key={inc.id}
                    incident={inc}
                    onSelect={setSelected}
                    selected={selected?.id === inc.id}
                  />
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-600">
                  <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No incidents in this category</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:w-80 shrink-0">
            <AnimatePresence mode="wait">
              {selected ? (
                <DetailPanel
                  key={selected.id}
                  incident={selected}
                  onClose={() => setSelected(null)}
                  onStatusChange={handleStatusChange}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900 border border-gray-800 border-dashed rounded-3xl p-8 text-center sticky top-20"
                >
                  <Users size={28} className="mx-auto mb-3 text-gray-700" />
                  <p className="text-gray-600 text-sm">Select an incident to view details and take action</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
