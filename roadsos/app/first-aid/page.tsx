import type { Metadata } from 'next';
import { BookOpen, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'First Aid — ROADSoS',
  description: 'Step-by-step first aid guides for CPR, burns, bleeding, fractures, and more.',
};

const FIRST_AID_CARDS = [
  {
    id: 'cpr',
    title: 'CPR',
    emoji: '🫀',
    colorClass: 'bg-red-500',
    summary: 'Cardiopulmonary resuscitation for unresponsive adults',
    steps: [
      'Call 112 immediately',
      'Place heel of hand on centre of chest',
      'Push down hard and fast — 100-120 compressions/min',
      'After 30 compressions, give 2 rescue breaths',
      'Continue until help arrives or person breathes',
    ],
  },
  {
    id: 'burns',
    title: 'Burns',
    emoji: '🔥',
    colorClass: 'bg-orange-500',
    summary: 'Treatment for thermal and chemical burns',
    steps: [
      'Remove from heat source immediately',
      'Cool burn under running water for 20 minutes',
      'Do NOT use ice, butter, or toothpaste',
      'Cover loosely with cling wrap or clean cloth',
      'For severe burns: call 112, do not remove clothing',
    ],
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding',
    emoji: '🩸',
    colorClass: 'bg-red-600',
    summary: 'Control heavy bleeding from wounds',
    steps: [
      'Call 112 for severe bleeding',
      'Apply firm, direct pressure with clean cloth',
      'Maintain pressure — do not remove cloth',
      'If cloth soaks through, add more on top',
      'Elevate injured limb above heart if possible',
      'For limb: apply tourniquet 5cm above wound if bleeding uncontrollable',
    ],
  },
  {
    id: 'choking',
    title: 'Choking',
    emoji: '🫁',
    colorClass: 'bg-violet-600',
    summary: 'Airway obstruction in adults and children',
    steps: [
      'Ask: "Are you choking?" — If they can cough, let them',
      'Lean person forward, give 5 firm back blows between shoulder blades',
      'Give 5 abdominal thrusts (Heimlich): stand behind, fist just above navel, pull sharply inward and upward',
      'Alternate back blows and abdominal thrusts',
      'If unconscious: start CPR, call 112',
    ],
  },
  {
    id: 'stroke',
    title: 'Stroke',
    emoji: '🧠',
    colorClass: 'bg-blue-600',
    summary: 'Recognise and respond to stroke — FAST',
    steps: [
      'F — Face: Ask to smile. Does face droop on one side?',
      'A — Arms: Raise both arms. Does one drift down?',
      'S — Speech: Repeat a sentence. Is it slurred or strange?',
      'T — Time: Call 112 IMMEDIATELY if any symptoms present',
      'Do NOT give food or water',
      'Note time symptoms started for doctors',
    ],
  },
  {
    id: 'heart-attack',
    title: 'Heart Attack',
    emoji: '❤️',
    colorClass: 'bg-red-500',
    summary: 'Signs and immediate response',
    steps: [
      'Call 112 immediately — do not drive yourself',
      'Help person sit or lie comfortably',
      'Loosen tight clothing',
      'Give aspirin 300mg if available and not allergic',
      'If unresponsive and not breathing: start CPR',
      'Stay with person until ambulance arrives',
    ],
  },
  {
    id: 'fracture',
    title: 'Fractures',
    emoji: '🦴',
    colorClass: 'bg-gray-500',
    summary: 'Suspected broken bones treatment',
    steps: [
      'Do not try to straighten the bone',
      'Immobilise the joint above and below fracture',
      'Use padding/bandage as splint — do not apply too tightly',
      'For open fractures: cover wound with clean cloth, do not remove objects',
      'Apply ice pack wrapped in cloth to reduce swelling',
      'Call 112 for suspected spinal, neck, or pelvic fractures',
    ],
  },
  {
    id: 'drowning',
    title: 'Drowning',
    emoji: '🌊',
    colorClass: 'bg-sky-500',
    summary: 'Water rescue and resuscitation',
    steps: [
      'Call 112 — do not jump in unless trained',
      'Throw a rope, life ring, or branch',
      'Once out of water: check if conscious and breathing',
      'If not breathing: tilt head back, start rescue breaths',
      'Start CPR if no pulse',
      'Even if person seems OK: take to hospital (secondary drowning risk)',
    ],
  },
  {
    id: 'snake-bite',
    title: 'Snake Bite',
    emoji: '🐍',
    colorClass: 'bg-green-600',
    summary: 'Venomous snake bite first response',
    steps: [
      'Call 112 immediately',
      'Keep person STILL and calm — movement spreads venom',
      'Immobilise bitten limb at heart level',
      'Remove rings and tight clothing near bite',
      'Do NOT cut wound, suck venom, or apply tourniquet',
      'Note snake appearance for antivenin identification',
    ],
  },
  {
    id: 'seizure',
    title: 'Seizure',
    emoji: '⚡',
    colorClass: 'bg-violet-500',
    summary: 'Epileptic seizure management',
    steps: [
      'Stay calm and time the seizure',
      'Clear area of hard/sharp objects',
      'Do NOT hold person down or put anything in mouth',
      'Roll into recovery position after convulsions stop',
      'Call 112 if: first seizure, lasts >5 min, person doesn\'t recover',
      'Stay with them until fully conscious',
    ],
  },
];

export default function FirstAidPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <header className="px-5 pt-14 pb-5 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
            <BookOpen size={18} className="text-green-400" />
          </div>
          <h1 className="font-black text-white text-xl">First Aid Guide</h1>
        </div>
        <p className="text-gray-500 text-sm">Step-by-step emergency instructions • Offline available</p>
        <div className="mt-3 flex items-center gap-2 bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-3 py-2">
          <Heart size={13} className="text-yellow-400 shrink-0" />
          <p className="text-yellow-200 text-xs">Always call 112 for life-threatening emergencies. These are guides, not substitutes for professional care.</p>
        </div>
      </header>

      {/* Cards */}
      <div className="px-5 py-5 space-y-3">
        {FIRST_AID_CARDS.map((card) => (
          <details
            key={card.id}
            className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
          >
            <summary className="flex items-center gap-4 px-4 py-4 cursor-pointer list-none select-none">
              <span className="text-3xl">{card.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-base">{card.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{card.summary}</p>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${card.colorClass}`} />
            </summary>
            <div className="px-4 pb-4 border-t border-gray-800 pt-3">
              <ol className="space-y-2">
                {card.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 ${card.colorClass}`}>
                      {i + 1}
                    </span>
                    <p className="text-gray-200 text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
              <a
                href="tel:112"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 font-semibold text-sm"
              >
                📞 Call 112 Emergency
              </a>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
