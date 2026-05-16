import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Volume2, VolumeX, ArrowLeft, AlertTriangle } from 'lucide-react';

interface Step { n: number; title: string; instruction: string; do: string; dont: string; icon: string; }
interface Category { id: string; icon: string; name: string; subtitle: string; accent: string; from: string; steps: Step[]; }

const CATEGORIES: Category[] = [
  {
    id: 'cpr', icon: '🫀', name: 'CPR & Cardiac', subtitle: '6 situations', accent: '#FF1744', from: 'from-red-700/70',
    steps: [
      { n:1, title:'Check Responsiveness', instruction:'Tap shoulders firmly. Shout "Are you okay?" twice. Look for chest movement.', do:'Tap both shoulders firmly', dont:'Shake the neck or head', icon:'👋' },
      { n:2, title:'Call 112', instruction:'Ask bystander to call 112. If alone put on speaker. Never leave patient alone.', do:'Shout "Call 112 now!"', dont:'Leave patient to make call', icon:'📞' },
      { n:3, title:'Open Airway', instruction:'Head-tilt chin-lift: one hand on forehead, two fingers lift chin gently.', do:'Head-tilt chin-lift', dont:'Force head back hard', icon:'🌬️' },
      { n:4, title:'30 Compressions', instruction:'Heel of hand on centre of chest. Push down 5–6 cm hard and fast at 100–120 bpm.', do:'Push hard, push fast 100+ bpm', dont:'Lift hands between compressions', icon:'💪' },
      { n:5, title:'2 Rescue Breaths', instruction:'Pinch nose, seal mouth, 2 breaths of 1 second each. Watch chest rise.', do:'30 compressions : 2 breaths', dont:'Blow too hard or fast', icon:'💨' },
    ],
  },
  {
    id: 'bleeding', icon: '🩸', name: 'Bleeding & Wounds', subtitle: '8 situations', accent: '#C62828', from: 'from-rose-800/70',
    steps: [
      { n:1, title:'Protect Yourself', instruction:'Use gloves or plastic bag. Never touch blood with bare hands if avoidable.', do:'Use barrier protection', dont:'Touch blood directly', icon:'🧤' },
      { n:2, title:'Apply Pressure', instruction:'Press clean cloth firmly on wound for 10 minutes without lifting.', do:'Firm steady 10-min pressure', dont:'Peek at wound repeatedly', icon:'🤲' },
      { n:3, title:'Elevate', instruction:'Raise injured limb above heart level while maintaining pressure.', do:'Elevate above heart', dont:'Elevate if fracture suspected', icon:'⬆️' },
      { n:4, title:'Bandage', instruction:'Snug (not tourniquet) bandage to hold dressing. Add more on top if soaked.', do:'Snug but not circulation-cutting', dont:'Remove soaked pad', icon:'🩹' },
    ],
  },
  {
    id: 'fractures', icon: '🦴', name: 'Fractures & Sprains', subtitle: '5 situations', accent: '#FF8F00', from: 'from-amber-700/70',
    steps: [
      { n:1, title:'Keep Still', instruction:'Immobilise the area. Never realign bones.', do:'Support as found', dont:'Attempt to realign bones', icon:'🛑' },
      { n:2, title:'Splint', instruction:'Use rigid material above and below fracture site padded for comfort.', do:'Pad the splint', dont:'Splint too tight', icon:'📐' },
      { n:3, title:'Ice & Elevate', instruction:'Ice wrapped in cloth 20 min on/off. Elevate if possible.', do:'Ice wrapped, 20 min', dont:'Apply ice directly to skin', icon:'🧊' },
      { n:4, title:'Transport', instruction:'Do NOT move if spine injury suspected. Otherwise carefully support limb.', do:'Support limb during transport', dont:'Let limb hang', icon:'🚑' },
    ],
  },
  {
    id: 'burns', icon: '🔥', name: 'Burns & Scalds', subtitle: '6 situations', accent: '#E65100', from: 'from-orange-700/70',
    steps: [
      { n:1, title:'Cool the Burn', instruction:'Cool running water (NOT cold/ice) for at least 20 minutes.', do:'Cool water 20+ minutes', dont:'Use ice, butter, or toothpaste', icon:'🚿' },
      { n:2, title:'Remove Clothing', instruction:'Carefully remove loose clothing/jewellery near burn unless stuck.', do:'Remove loose items gently', dont:'Pull off stuck fabric', icon:'👕' },
      { n:3, title:'Cover Loosely', instruction:'Cling film or clean non-fluffy dressing. Do not wrap tightly.', do:'Cling film or sterile dressing', dont:'Use fluffy cotton', icon:'🩹' },
      { n:4, title:'Go to Hospital', instruction:'Any burn larger than palm of hand needs hospital. Call 108 for severe.', do:'A&E for large/deep burns', dont:'Pop blisters', icon:'🏥' },
    ],
  },
  {
    id: 'choking', icon: '😮‍💨', name: 'Choking & Breathing', subtitle: '4 situations', accent: '#2979FF', from: 'from-blue-700/70',
    steps: [
      { n:1, title:'Encourage Coughing', instruction:'Ask "Are you choking?" If they can speak/cough, encourage hard coughing.', do:'Encourage forceful cough first', dont:'Act if they can still cough', icon:'🗣️' },
      { n:2, title:'5 Back Blows', instruction:'5 firm blows between shoulder blades with heel of hand. Check after each.', do:'5 firm back blows', dont:'Tap gently', icon:'👋' },
      { n:3, title:'Abdominal Thrusts', instruction:'Stand behind, arms around waist. Fist above navel. Pull sharply inward-upward.', do:'Sharp upward thrusts', dont:'Use on pregnant or infant', icon:'🤜' },
      { n:4, title:'Call 112', instruction:'If not cleared after 5+5 cycle, call 112 and continue alternating.', do:'Alternate 5 blows + 5 thrusts', dont:'Give up', icon:'📞' },
    ],
  },
  {
    id: 'road', icon: '🚗', name: 'Road Accident', subtitle: '7 situations', accent: '#FFB300', from: 'from-yellow-700/70',
    steps: [
      { n:1, title:'Make Scene Safe', instruction:'Hazard lights on. Keep distance from fuel leaks. Do NOT move casualty.', do:'Hazard lights, safe distance', dont:'Move victim if spine suspected', icon:'⚠️' },
      { n:2, title:'Call 112 & 108', instruction:'State: road name, direction, number of casualties, obvious injuries, hazards.', do:'Give clear location details', dont:'Hang up until told', icon:'📞' },
      { n:3, title:'Check Breathing', instruction:'Look, listen, feel for 10 seconds. Recovery position if unconscious & breathing.', do:'Recovery position if unconscious & breathing', dont:'Tilt head if spine injury', icon:'👁️' },
      { n:4, title:'Control Bleeding', instruction:'Firm pressure with clean cloth. Maintain constantly.', do:'Firm constant pressure', dont:'Remove soaked dressings', icon:'🤲' },
      { n:5, title:'Keep Warm & Calm', instruction:'Reassure. Cover with jacket/blanket. Talk calmly until ambulance arrives.', do:'Talk calmly, keep warm', dont:'Give food, water or medication', icon:'🧣' },
    ],
  },
  {
    id: 'bites', icon: '🐍', name: 'Bites & Stings', subtitle: '5 situations', accent: '#00C853', from: 'from-green-800/70',
    steps: [
      { n:1, title:'Move Away', instruction:'Back away calmly. Photo the snake if safe — do NOT catch it.', do:'Back away slowly', dont:'Catch or kill the snake', icon:'🚶' },
      { n:2, title:'Immobilise', instruction:'Keep bitten limb below heart level. Remove rings near bite.', do:'Limb still and below heart', dont:'Apply tourniquet', icon:'🛑' },
      { n:3, title:'Do NOT Suck', instruction:'Do NOT suck venom, cut the bite, apply ice or electricity.', do:'Keep calm and still', dont:'Suck, cut or apply ice', icon:'❌' },
      { n:4, title:'Rush to Hospital', instruction:'India has antivenom at district hospitals. 30-minute window is critical.', do:'Nearest government hospital', dont:'Rely on home remedies', icon:'🚑' },
    ],
  },
  { id: 'unsure', icon: '❓', name: "Not Sure?", subtitle: 'AI will guide you', accent: '#7C4DFF', from: 'from-purple-800/70', steps: [] },
];

function StepCard({ step, total, accent }: { step: Step; total: number; accent: string }) {
  return (
    <motion.div key={step.n} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="flex flex-col gap-5"
      style={{ '--accent': accent } as React.CSSProperties}>
      {/* dots */}
      <div className="flex gap-2 justify-center mt-2">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step.n - 1 ? 'w-6 bg-(--accent)' : 'w-2 bg-white/15'}`} />
        ))}
      </div>
      {/* illustration */}
      <div className="flex items-center justify-center h-28 rounded-3xl bg-white/5 border border-white/8">
        <span className="text-7xl select-none">{step.icon}</span>
      </div>
      {/* badge + text */}
      <div>
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-black bg-(--accent)">{step.n}</div>
          <h2 className="text-xl font-black text-white tracking-tight">{step.title}</h2>
        </div>
        <p className="text-[17px] leading-relaxed text-white/80 mb-4">{step.instruction}</p>
      </div>
      {/* do/dont */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-green-500/10 border border-green-500/25 p-3">
          <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mb-1">✓ DO</p>
          <p className="text-[12px] text-green-300 leading-snug">{step.do}</p>
        </div>
        <div className="rounded-2xl bg-red-500/10 border border-red-500/25 p-3">
          <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">✗ DON'T</p>
          <p className="text-[12px] text-red-300 leading-snug">{step.dont}</p>
        </div>
      </div>
    </motion.div>
  );
}

function GuideScreen({ cat, onBack }: { cat: Category; onBack: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [voiceOn, setVoiceOn] = useState(false);
  const cur = cat.steps[step];

  useEffect(() => {
    if (!voiceOn || !cur) return;
    const utt = new SpeechSynthesisUtterance(`Step ${cur.n}. ${cur.title}. ${cur.instruction}. Tap Next when ready.`);
    utt.rate = 0.88;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
    return () => { window.speechSynthesis.cancel(); };
  }, [step, voiceOn, cur]);

  if (!cur) return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-5 gap-6" style={{ '--accent': cat.accent } as React.CSSProperties}>
      <span className="text-7xl">✅</span>
      <h2 className="text-2xl font-black text-white text-center">All steps complete!</h2>
      <p className="text-white/50 text-center">Call 112 if the situation hasn't improved.</p>
      <button onClick={onBack} aria-label="Back to First Aid" className="w-full py-4 rounded-2xl font-black text-xl text-black bg-(--accent)">
        Back to First Aid
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-base flex flex-col" style={{ '--accent': cat.accent } as React.CSSProperties}>
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <button onClick={onBack} aria-label="Back" className="p-2 rounded-xl bg-white/5"><ArrowLeft size={20} className="text-white" /></button>
        <h1 className="text-[15px] font-black text-white">{cat.icon} {cat.name}</h1>
        <button onClick={() => setVoiceOn(v => !v)} aria-label={voiceOn ? "Turn off voice guidance" : "Turn on voice guidance"} className={`p-2 rounded-xl ${voiceOn ? 'bg-amber-400/20' : 'bg-white/5'}`}>
          {voiceOn ? <Volume2 size={20} className="text-amber-400" /> : <VolumeX size={20} className="text-white/40" />}
        </button>
      </div>
      <div className="flex-1 px-4 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          <StepCard key={step} step={cur} total={cat.steps.length} accent={cat.accent} />
        </AnimatePresence>
        <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          <p className="text-[12px] text-amber-300 flex-1">Situation worsening?</p>
          <button onClick={() => navigate('/assistant')} className="text-[11px] font-black text-amber-400 underline">AI Help</button>
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 px-4 pb-6 pt-4 bg-linear-to-t from-base to-transparent">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(s => s + 1)}
          aria-label="Next Step"
          className="w-full h-[72px] rounded-2xl font-black text-xl text-black flex items-center justify-center gap-3 bg-(--accent)">
          Next Step <ChevronRight size={22} />
        </motion.button>
      </div>
    </div>
  );
}

export const FirstAidScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Category | null>(null);

  return (
    <AnimatePresence mode="wait">
      {!selected ? (
        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="min-h-screen bg-base px-4 pb-24">
          <div className="pt-12 pb-6">
            <h1 className="text-3xl font-black text-white tracking-tight">🩺 First Aid</h1>
            <p className="text-white/40 text-sm mt-1">Tap any situation to begin guided steps</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button key={cat.id} onClick={() => cat.id === 'unsure' ? navigate('/assistant') : setSelected(cat)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.055 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Select ${cat.name} guide`}
                className={`h-[120px] rounded-2xl bg-linear-to-br ${cat.from} to-raised border border-white/10 p-4 flex flex-col items-start justify-between text-left shadow-[0_4px_20px_color-mix(in_srgb,var(--accent),transparent_80%)]`}
                style={{ '--accent': cat.accent } as React.CSSProperties}>
                <span className="text-4xl">{cat.icon}</span>
                <div>
                  <p className="text-[15px] font-black text-white leading-tight">{cat.name}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{cat.subtitle}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div key="guide" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          <GuideScreen cat={selected} onBack={() => setSelected(null)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default FirstAidScreen;
