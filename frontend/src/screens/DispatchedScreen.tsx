import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSosStore } from '../store/sosStore';
import { AnimatedAmbulance3D } from '../components/AnimatedAmbulance3D';
import {
  Phone, Share2, Users, ChevronDown, ChevronUp,
  Hospital, Navigation
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────── */
const USER_POS: [number, number]  = [28.6139, 77.2090];
const HOSP_POS: [number, number]  = [28.6350, 77.2250];
const ROUTE_COORDS: [number, number][] = [
  HOSP_POS, [28.628, 77.218], [28.620, 77.212], USER_POS
];

/* Custom Leaflet icons */
const redIcon = L.divIcon({
  html: `<div class="w-[18px] h-[18px] rounded-full bg-[#FF1744] border-[3px] border-white shadow-[0_0_0_4px_rgba(255,23,68,0.3)]"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9], className: ''
});
const greenIcon = L.divIcon({
  html: `<div class="w-[28px] h-[28px] rounded-full bg-[#00C853] border-2 border-white flex items-center justify-center font-black text-[12px] text-white">H</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14], className: ''
});

/* ── Golden Hour Timer ──────────────────────────────────────── */
function GoldenHourTimer({ goldenHourStart }: { goldenHourStart: number }) {
  const [remaining, setRemaining] = useState(3600);
  const radius = 22;
  const circ   = 2 * Math.PI * radius;

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - goldenHourStart) / 1000);
      setRemaining(Math.max(0, 3600 - elapsed));
    }, 1000);
    return () => clearInterval(id);
  }, [goldenHourStart]);

  const pct = remaining / 3600;
  const mm  = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss  = String(remaining % 60).padStart(2, '0');
  
  // Map color to Tailwind classes
  const colorClass = pct > 0.6 ? 'text-green-500' : pct > 0.3 ? 'text-amber-500' : 'text-red-500';
  const strokeColor = pct > 0.6 ? '#00C853' : pct > 0.3 ? '#FF8F00' : '#FF1744';

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-14">
        <svg width={56} height={56} className="-rotate-90">
          <circle cx={28} cy={28} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
          <motion.circle
            cx={28} cy={28} r={radius}
            fill="none" stroke={strokeColor} strokeWidth={4}
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 1 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white/70 font-mono">
          {pct > 0 ? '⏱' : '!'}
        </span>
      </div>
      <div>
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Golden Hour</p>
        <p className={`font-mono font-black text-lg ${colorClass}`}>
          {mm}:{ss} <span className="text-[10px] text-white/40 font-normal">remaining</span>
        </p>
      </div>
    </div>
  );
}

/* ── AI Thinking Panel ──────────────────────────────────────── */
const AI_STREAM_TEXT = [
  '> Analyzing crash telemetry…',
  '> G-force: 4.2G — severe impact detected',
  '> Contacting nearest trauma centre…',
  '> Apollo Hospital: 6 min ETA confirmed',
  '> Alerting 3 emergency contacts via WhatsApp',
  '> India 112 uplink established',
  '> Recommending: Keep patient still, monitor breathing',
  '> Blood type O+ — compatible transfusion ready',
];

function AIThinkingPanel() {
  const [open, setOpen] = useState(false);
  const [displayed, setDisplayed] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    if (lineIdx >= AI_STREAM_TEXT.length) return;
    const fullLine = AI_STREAM_TEXT[lineIdx];
    if (charIdx < fullLine.length) {
      const id = setTimeout(() => {
        setDisplayed(prev => prev + fullLine[charIdx]);
        setCharIdx(c => c + 1);
      }, 28);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => {
        setDisplayed(prev => prev + '\n');
        setLineIdx(l => l + 1);
        setCharIdx(0);
      }, 400);
      return () => clearTimeout(id);
    }
  }, [open, lineIdx, charIdx]);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">AI Tactical Analysis</span>
        </div>
        {open ? <ChevronUp size={14} className="text-amber-400" /> : <ChevronDown size={14} className="text-amber-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 160 }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <pre className="px-4 pb-4 text-[11px] font-mono text-amber-300/80 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[140px]">
              {displayed}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── progress bar (hospital → ambulance → user) ─────────────── */
function AmbulanceProgressBar({ eta, totalEta }: { eta: number; totalEta: number }) {
  const pct = Math.max(0, Math.min(100, ((totalEta - eta) / totalEta) * 100));
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
        <span className="flex items-center gap-1"><Hospital size={10} /> Hospital</span>
        <span className="flex items-center gap-1"><Navigation size={10} /> You</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-amber-500 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-white/30">
        <span>🚑 En route</span>
        <span>{Math.round(100 - pct)}% to go</span>
      </div>
    </div>
  );
}

import { MapContainer, TileLayer, Marker, Polyline, Circle } from 'react-leaflet';

/* ── map wrapper ─────────────────────────────────────────────── */
function DarkMap() {
  return (
    <MapContainer
      center={USER_POS}
      zoom={14}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />
      {/* user — red pulsing */}
      <Circle center={USER_POS} radius={80} color="#FF1744" fillColor="#FF1744" fillOpacity={0.2} weight={2} />
      <Marker position={USER_POS} icon={redIcon} />
      {/* hospital */}
      <Marker position={HOSP_POS} icon={greenIcon} />
      {/* route dotted blue */}
      <Polyline
        positions={ROUTE_COORDS}
        color="#2979FF"
        weight={3}
        dashArray="8 6"
      />
    </MapContainer>
  );
}

/* ── MAIN SCREEN ─────────────────────────────────────────────── */
export const DispatchedScreen: React.FC = () => {
  const navigate = useNavigate();
  const { incidentId } = useParams();
  const { cancelSOS, crashDetectedAt: storeTime } = useSosStore();
  const [fallbackTime] = useState(() => Date.now());
  const crashDetectedAt = storeTime || fallbackTime;
  
  const [eta, setEta] = useState(6 * 60); // 6 min in seconds

  useEffect(() => {
    const id = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const etaMin  = Math.floor(eta / 60);
  const etaSec  = String(eta % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 bg-[#080C14] flex flex-col overflow-hidden">
      {/* ── TOP HALF: Leaflet map ── */}
      <div className="h-[40vh] min-h-[200px] relative shrink-0">
        <DarkMap />
        {/* overlay: incident tag */}
        <div className="absolute top-3 left-3 z-500 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
            Incident {incidentId}
          </span>
        </div>
      </div>

      {/* ── BOTTOM HALF: info ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Golden hour */}
        <GoldenHourTimer goldenHourStart={crashDetectedAt} />

        {/* Ambulance 3D preview */}
        <div className="flex justify-center">
          <AnimatedAmbulance3D width={300} height={140} />
        </div>

        {/* Ambulance card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] text-white/40 uppercase tracking-widest">🚑 Dispatched</p>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">Apollo ALS Unit</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 uppercase">ETA</p>
              <p className="font-mono font-black text-amber-400 text-2xl">{etaMin}:{etaSec}</p>
            </div>
          </div>

          <AmbulanceProgressBar eta={eta} totalEta={6 * 60} />

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/40">Apollo Hospitals, Sarita Vihar</p>
              <p className="text-[11px] text-white/60">+91-11-2692-5858</p>
            </div>
            <button
              onClick={() => window.location.href = 'tel:+911126925858'}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 text-[12px] font-bold"
            >
              <Phone size={12} /> Call
            </button>
          </div>
        </div>

        {/* AI thinking */}
        <AIThinkingPanel />

        {/* Action row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Share2, label: 'Share Location', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: Phone,  label: 'Call 112',       color: 'text-red-400',  bg: 'bg-red-500/10 border-red-500/20',
              onClick: () => window.location.href = 'tel:112' },
            { icon: Users,  label: 'Bystander Guide',color: 'text-amber-400',bg: 'bg-amber-500/10 border-amber-500/20',
              onClick: () => navigate('/bystander') },
          ].map(({ icon: Icon, label, color, bg, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border ${bg} transition-all active:scale-95`}
            >
              <Icon size={20} className={color} />
              <span className={`text-[10px] font-bold ${color} text-center leading-tight`}>{label}</span>
            </button>
          ))}
        </div>

        {/* Safe button */}
        <button
          onClick={() => { cancelSOS(); navigate('/'); }}
          className="w-full py-4 rounded-2xl border border-white/10 text-white/60 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-all"
        >
          ✓ I Am Safe — Close
        </button>
      </div>
    </div>
  );
};

export default DispatchedScreen;
