import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useSafetyTimerStore } from '../store/safetyTimerStore';
import { useUserStore } from '../userStore';

const PRESETS = [
  { label: '5 min',  ms: 5   * 60_000 },
  { label: '15 min', ms: 15  * 60_000 },
  { label: '30 min', ms: 30  * 60_000 },
  { label: '1 hr',   ms: 60  * 60_000 },
  { label: '2 hr',   ms: 120 * 60_000 },
];

export const SafetyTimerPage: React.FC = () => {
  const navigate = useNavigate();
  const { contacts } = useUserStore();
  const { start, active, stop } = useSafetyTimerStore();

  const [chosen, setChosen] = useState(PRESETS[2].ms);
  const [customMin, setCustomMin] = useState('');
  const [selected, setSelected] = useState<string[]>(contacts.slice(0, 1).map(c => c.id));
  const [done, setDone] = useState(false);

  const toggle = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleStart = () => {
    const ms = customMin ? parseInt(customMin) * 60_000 : chosen;
    if (!ms || selected.length === 0) return;
    start(ms, selected);
    setDone(true);
    setTimeout(() => navigate('/'), 1200);
  };

  return (
    <div className="min-h-screen bg-base pb-32">
      {/* header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/5" aria-label="Go back">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight">Safety Timer</h1>
          <p className="text-text-secondary text-[12px] mt-0.5">Auto-alerts family if you don't check in</p>
        </div>
      </div>

      {/* already active banner */}
      {active && (
        <div className="mx-4 mb-6 px-4 py-4 rounded-2xl bg-green/10 border border-green/30 flex items-center gap-3">
          <CheckCircle size={20} className="text-green" />
          <div className="flex-1">
            <p className="text-[14px] font-black text-green">Timer is running</p>
            <p className="text-[11px] text-green/60">Check in from the green strip at top</p>
          </div>
          <button onClick={stop} className="px-3 py-1.5 rounded-xl bg-red/20 text-red font-bold text-[12px]">Stop</button>
        </div>
      )}

      {/* duration */}
      <div className="px-4 mb-6">
        <p className="text-[11px] text-text-muted uppercase tracking-widest mb-3">Duration</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PRESETS.map(p => (
            <button key={p.ms} onClick={() => { setChosen(p.ms); setCustomMin(''); }}
              className={`py-3 rounded-2xl font-black text-[15px] transition-all ${chosen === p.ms && !customMin ? 'bg-saffron text-black' : 'bg-white/6 text-text-secondary border border-white/10'}`}>
              {p.label}
            </button>
          ))}
          <button onClick={() => setChosen(0)}
            className={`py-3 rounded-2xl font-bold text-[14px] transition-all ${chosen === 0 ? 'border-saffron border-2 text-saffron' : 'bg-white/6 text-text-muted border border-white/10'}`}>
            Custom
          </button>
        </div>
        {chosen === 0 && (
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Minutes" value={customMin}
              onChange={e => setCustomMin(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-text text-[15px] focus:outline-none focus:border-saffron/40" />
            <span className="text-text-muted text-[13px]">minutes</span>
          </div>
        )}
      </div>

      {/* contacts */}
      <div className="px-4 mb-8">
        <p className="text-[11px] text-text-muted uppercase tracking-widest mb-3">Alert These Contacts</p>
        {contacts.length === 0 ? (
          <button onClick={() => navigate('/emergency-contacts')}
            className="w-full py-4 rounded-2xl border border-dashed border-white/15 text-text-secondary text-[14px]">
            + Add emergency contacts first
          </button>
        ) : (
          <div className="space-y-2">
            {contacts.map(c => {
              const on = selected.includes(c.id);
              return (
                <motion.button key={c.id} onClick={() => toggle(c.id)} whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${on ? 'bg-saffron/10 border-saffron/40' : 'bg-white/4 border-white/8'}`}>
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-[13px] shrink-0">
                    {c.name.split(' ').map((w: string) => w[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-bold text-[14px] ${on ? 'text-text' : 'text-text-secondary'}`}>{c.name}</p>
                    <p className="text-[11px] text-text-muted">{c.relationship}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${on ? 'border-saffron bg-saffron' : 'border-white/20'}`}>
                    {on && <span className="text-black text-[10px] font-black">✓</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 px-4 pb-8 pt-4 bg-linear-to-t from-base to-transparent">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="w-full h-16 rounded-2xl bg-green flex items-center justify-center gap-2 font-black text-white text-xl">
              <CheckCircle size={22} /> Timer Started!
            </motion.div>
          ) : (
            <motion.button key="start" whileTap={{ scale: 0.97 }} onClick={handleStart}
              disabled={selected.length === 0}
              className={`w-full h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${selected.length > 0 ? 'bg-saffron text-black' : 'bg-white/8 text-text-muted'}`}>
              <Clock size={22} /> Start Safety Timer
            </motion.button>
          )}
        </AnimatePresence>
        <p className="text-[11px] text-text-muted/60 text-center mt-2">
          {selected.length} contact{selected.length !== 1 ? 's' : ''} will receive an SMS alert if you don't check in
        </p>
      </div>
    </div>
  );
};

export default SafetyTimerPage;
