import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Volume2, ShieldCheck } from 'lucide-react';
import { GoodSamaritanCollapsible } from '../pages/GoodSamaritanGuide';

const STEPS = [
  {
    title: "Check for Safety",
    desc: "Ensure the area is safe for you to help. Look for traffic, fire, or hazards.",
    instruction: "SECURE THE AREA FIRST",
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <motion.circle cx="200" cy="150" r="80" fill="transparent" stroke="var(--cyan)" strokeWidth="2" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
        <path d="M200 100 L200 200 M150 150 L250 150" stroke="var(--cyan)" strokeWidth="4" />
      </svg>
    )
  },
  {
    title: "Check Response",
    desc: "Tap the person's shoulder and shout. Check if they are breathing normally.",
    instruction: "SHOUT AND GENTLY SHAKE",
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <motion.path d="M150 200 Q200 150 250 200" fill="none" stroke="white" strokeWidth="6" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} />
        <circle cx="200" cy="120" r="30" fill="var(--cyan)" />
      </svg>
    )
  },
  {
    title: "Call for Help",
    desc: "Tell someone specifically to call 112 and find an AED if available.",
    instruction: "ASSIGN TASKS CLEARLY",
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <motion.rect x="160" y="100" width="80" height="120" rx="10" fill="var(--amber-alert)" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
        <path d="M180 130 H220 M180 160 H220" stroke="var(--night)" strokeWidth="4" />
      </svg>
    )
  },
  {
    title: "Start Compressions",
    desc: "Push hard and fast in the center of the chest. 100-120 beats per minute.",
    instruction: "PUSH HARD AND FAST",
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <motion.circle cx="200" cy="150" r="40" fill="var(--sos-red)" animate={{ scale: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} />
        <path d="M200 110 V190 M160 150 H240" stroke="white" strokeWidth="8" />
      </svg>
    )
  },
  {
    title: "Rescue Breaths",
    desc: "If trained, give 2 breaths after every 30 compressions. Keep the airway open.",
    instruction: "30 PRESSES : 2 BREATHS",
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <motion.path d="M150 150 Q200 100 250 150" fill="none" stroke="var(--safe-green)" strokeWidth="6" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} />
      </svg>
    )
  },
  {
    title: "Wait for EMS",
    desc: "Continue CPR until the ambulance arrives or the person starts breathing.",
    instruction: "DO NOT STOP UNTIL HELP IS HERE",
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <motion.path d="M100 200 L300 200 L320 160 L300 120 L100 120 Z" fill="var(--cyan)" animate={{ x: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 0.5 }} />
        <circle cx="150" cy="220" r="15" fill="white" />
        <circle cx="250" cy="220" r="15" fill="white" />
      </svg>
    )
  }
];

export const BystanderMode: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showLegalGuide, setShowLegalGuide] = useState(true);

  const speak = () => {
    const text = `${STEPS[currentStep].title}. ${STEPS[currentStep].desc}`;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 flex flex-col bg-night relative overflow-hidden">
      {/* Progress Dots */}
      <div className="h-16 flex items-center justify-center gap-3 px-12 z-10">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: i === currentStep ? 1.5 : 1,
              opacity: i <= currentStep ? 1 : 0.3 
            }}
            className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-cyan' : 'bg-white'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex-1 flex flex-col px-8"
        >
          {/* Legal Guide Integration */}
          {currentStep === 0 && showLegalGuide && (
            <GoodSamaritanCollapsible onDismiss={() => setShowLegalGuide(false)} />
          )}

          {/* Illustration Zone */}
          <div className="flex-[0.45] flex items-center justify-center bg-night-2/30 rounded-[3rem] mb-8 border border-white/5">
            {STEPS[currentStep].illustration}
          </div>

          {/* Instruction Zone */}
          <div className="flex-[0.3] flex flex-col items-center text-center">
            <span className="text-cyan font-black uppercase tracking-[0.2em] text-xs mb-2">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <h2 className="text-3xl font-black text-white mb-4 leading-none uppercase">
              {STEPS[currentStep].instruction}
            </h2>
            <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-sm">
              {STEPS[currentStep].desc}
            </p>
            
            <button 
              onClick={speak}
              className="mt-6 flex items-center gap-3 text-cyan bg-cyan/10 px-6 py-3 rounded-2xl border border-cyan/20 active:scale-95 transition-transform"
            >
              <Volume2 size={24} />
              <span className="font-bold uppercase tracking-widest text-sm">Read Aloud</span>
            </button>
          </div>

          {/* Navigation Zone */}
          <div className="flex-[0.25] flex flex-col justify-center gap-4">
            <div className="flex gap-4">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 h-20 border-2 border-white/10 text-white rounded-3xl flex items-center justify-center gap-2 font-bold disabled:opacity-30 active:scale-95 transition-transform"
              >
                <ChevronLeft size={24} /> BACK
              </button>
              <button
                onClick={() => {
                  if (currentStep < STEPS.length - 1) {
                    setCurrentStep(prev => prev + 1);
                  } else {
                    navigate('/incident-report');
                  }
                }}
                className={`flex-2 h-20 rounded-3xl flex items-center justify-center gap-2 text-xl font-black tracking-tighter active:scale-95 transition-transform ${
                  currentStep === STEPS.length - 1 ? 'bg-safe text-night' : 'bg-cyan text-night'
                }`}
              >
                {currentStep === STEPS.length - 1 ? (
                  <>DONE <Check size={28} /></>
                ) : (
                  <>NEXT STEP <ChevronRight size={28} /></>
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-warning py-2">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest underline decoration-amber-alert/40 underline-offset-4">
                Good Samaritan Law protects you
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
