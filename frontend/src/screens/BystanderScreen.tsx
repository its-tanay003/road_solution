import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Info, Shield } from 'lucide-react';

/* ── Good Samaritan banner ──────────────────────────────────── */
function GSLBanner() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mx-4 mt-4">
      <motion.button onClick={() => setExpanded(e => !e)} className="w-full text-left">
        <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
          <Shield size={16} className="text-amber-500 shrink-0" />
          <p className="flex-1 text-[12px] text-amber-300 font-medium leading-tight">
            You are protected by India's Good Samaritan Law (2016)
          </p>
          <Info size={14} className="text-amber-400 shrink-0" />
        </div>
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pt-3 pb-4 text-[12px] text-white/60 leading-relaxed space-y-2">
              <p><strong className="text-amber-400">What it means:</strong> The Supreme Court of India (2016) mandates that hospitals treat road accident victims immediately without demanding payment first.</p>
              <p><strong className="text-amber-400">Your protection:</strong> Good Samaritans helping accident victims cannot be detained by police, called as witnesses without consent, or harassed for helping.</p>
              <p><strong className="text-amber-400">Bottom line:</strong> Help freely. The law is on your side.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Entry option card ──────────────────────────────────────── */
function OptionCard({ emoji, title, subtitle, titleClassName, bg, border, onClick }: {
  emoji: string; title: string; subtitle: string;
  titleClassName: string; bg: string; border: string; onClick: () => void;
}) {
  return (
    <motion.button 
      whileTap={{ scale: 0.97 }} 
      onClick={onClick}
      className={`w-full h-[130px] rounded-3xl ${bg} border ${border} flex items-center gap-5 px-6 text-left focus:outline-none focus:ring-2 focus:ring-white/20`}
      aria-label={`${title}: ${subtitle}`}
    >
      <span className="text-5xl shrink-0" aria-hidden="true">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-[20px] font-black leading-tight ${titleClassName}`}>{title}</p>
        <p className="text-[13px] text-white/50 mt-1 leading-snug">{subtitle}</p>
      </div>
      <ChevronRight size={20} className="text-white/30 shrink-0" />
    </motion.button>
  );
}

/* ── 3-step report flow ─────────────────────────────────────── */
const REPORT_STEPS = [
  { q: 'What happened?', opts: ['Vehicle collision', 'Person fell/injured', 'Medical emergency', 'Fire on road', 'Other'] },
  { q: 'How many people need help?', opts: ['1 person', '2–3 people', '4–6 people', '7+ people', 'Unknown'] },
  { q: 'Is anyone conscious?', opts: ['Yes, all conscious', 'Some unconscious', 'All unconscious', 'Not sure'] },
];

function ReportFlow({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const cur = REPORT_STEPS[step];
  const select = (opt: string) => {
    const newAns = [...answers.slice(0, step), opt];
    setAnswers(newAns);
    if (step < REPORT_STEPS.length - 1) { setStep(s => s + 1); }
    else { onDone(); }
  };

  return (
    <div className="min-h-dvh bg-void flex flex-col px-4">
      {/* progress */}
      <div className="flex items-center gap-3 pt-12 pb-8">
        <button 
          onClick={onBack} 
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex gap-2 flex-1">
          {REPORT_STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                i <= step ? 'bg-red-accent' : 'bg-white/12'
              }`}
            />
          ))}
        </div>
        <span className="text-[12px] text-white/30 font-mono" aria-label={`Step ${step + 1} of ${REPORT_STEPS.length}`}>
          {step + 1}/{REPORT_STEPS.length}
        </span>
      </div>

      <motion.div key={step} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}>
        <h2 className="text-2xl font-black text-white mb-8">{cur.q}</h2>
        <div className="space-y-3">
          {cur.opts.map(opt => (
            <motion.button key={opt} whileTap={{ scale: 0.97 }} onClick={() => select(opt)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white/5 border border-white/8 text-white text-[16px] font-medium hover:bg-white/10 hover:border-red-500/30 transition-all">
              {opt} <ChevronRight size={16} className="text-white/30" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────── */
type View = 'entry' | 'report' | 'done';

export const BystanderScreen: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('entry');

  if (view === 'report') return <ReportFlow onDone={() => setView('done')} onBack={() => setView('entry')} />;

  if (view === 'done') return (
    <div className="min-h-dvh bg-void flex flex-col items-center justify-center px-5 gap-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        <span className="text-8xl" role="img" aria-label="SOS success">🆘</span>
      </motion.div>
      <h2 className="text-2xl font-black text-white text-center">Help is on the way!</h2>
      <p className="text-white/50 text-center text-[15px]">Emergency services have been notified. Stay with the victim and keep them calm.</p>
      <div className="w-full space-y-3 mt-4">
        <button onClick={() => navigate('/first-aid')}
          className="w-full py-4 rounded-2xl bg-amber-400 text-black font-black text-[16px] hover:bg-amber-300 transition-colors">
          Open First Aid Guide
        </button>
        <button onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl border border-white/10 text-white/60 font-bold text-[14px] hover:bg-white/5 transition-colors">
          Return Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      {/* header */}
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Bystander Mode</h1>
        <p className="text-white/40 text-sm mt-1.5">You can save a life today.</p>
      </div>

      <GSLBanner />

      {/* main options */}
      <div className="px-4 mt-8 space-y-4">
        <OptionCard
          emoji="🚨" title="I FOUND AN ACCIDENT"
          subtitle="Report incident and get emergency help dispatched immediately"
          titleClassName="text-red-accent" bg="bg-red-600/8" border="border-red-500/25"
          onClick={() => setView('report')}
        />
        <OptionCard
          emoji="🤝" title="I WANT TO HELP SOMEONE"
          subtitle="Get step-by-step first aid guidance for the situation"
          titleClassName="text-amber-500" bg="bg-amber-500/8" border="border-amber-500/25"
          onClick={() => navigate('/first-aid')}
        />
      </div>

      {/* emergency numbers quick strip */}
      <div className="px-4 mt-8">
        <p className="text-[11px] text-white/30 uppercase tracking-widest mb-3">Quick Emergency Dial</p>
        <div className="grid grid-cols-3 gap-3">
          {[['📞 112', 'Emergency', '112'], ['🚑 108', 'Ambulance', '108'], ['🔥 101', 'Fire', '101']].map(([label, sub, num]) => (
            <button 
              key={num} 
              onClick={() => window.location.href = `tel:${num}`}
              className="py-3 rounded-2xl bg-white/5 border border-white/8 flex flex-col items-center gap-1 active:scale-95 transition-transform hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label={`Call ${sub}: ${num}`}
            >
              <span className="text-lg" aria-hidden="true">{label.split(' ')[0]}</span>
              <span className="text-[13px] font-black text-white">{num}</span>
              <span className="text-[10px] text-white/40">{sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BystanderScreen;
