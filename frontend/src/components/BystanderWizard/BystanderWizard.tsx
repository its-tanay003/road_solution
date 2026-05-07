import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Step {
  id: number;
  titleKey: string;
  subKey: string;
  icon: string;
  color: string;
}

const STEPS: Step[] = [
  { id: 1, titleKey: 'bystander.step1.title', subKey: 'bystander.step1.sub', icon: '🚫', color: '#FF6B35' },
  { id: 2, titleKey: 'bystander.step2.title', subKey: 'bystander.step2.sub', icon: '📞', color: '#FF1744' },
  { id: 3, titleKey: 'bystander.step3.title', subKey: 'bystander.step3.sub', icon: '💨', color: '#00BCD4' },
  { id: 4, titleKey: 'bystander.step4.title', subKey: 'bystander.step4.sub', icon: '🩹', color: '#4CAF50' },
  { id: 5, titleKey: 'bystander.step5.title', subKey: 'bystander.step5.sub', icon: '🔄', color: '#9C27B0' },
  { id: 6, titleKey: 'bystander.step6.title', subKey: 'bystander.step6.sub', icon: '🚑', color: '#1D9E75' },
];

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9;
  utt.lang = 'en-IN';
  window.speechSynthesis.speak(utt);
}

export function BystanderWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [completed, setCompleted] = useState(false);
  const { t } = useTranslation();

  const step = STEPS[currentStep];

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      const next = STEPS[currentStep + 1];
      speak(`${t(next.titleKey)}. ${t(next.subKey)}`);
    } else {
      setCompleted(true);
    }
  }, [currentStep, t]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-4 max-w-md mx-auto"
      >
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-safe mb-2 text-2xl font-bold">
          Well done. You helped save a life.
        </h2>
        <p className="opacity-70 mb-6 leading-relaxed">
          India's Good Samaritan Guidelines 2015 protect you.
          You cannot be penalized for helping in good faith.
        </p>
        <button
          onClick={() => { setCurrentStep(0); setCompleted(false); }}
          className="px-8 py-3 rounded-xl bg-safe text-white font-semibold cursor-pointer"
        >
          Start over
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col min-h-full max-w-md mx-auto">
      {/* Good Samaritan Banner */}
      <div className="bg-orange-700 px-4 py-2 text-xs text-white rounded-b-xl text-center mx-4">
        India's Good Samaritan Law 2015 protects you — you are legally safe to help.
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.id}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentStep ? 'bg-safe w-2' : 
              i === currentStep ? 'w-6' : 'bg-white/20 w-2'
            }`}
            animate={{ backgroundColor: i === currentStep ? s.color : undefined }}
          />
        ))}
      </div>
      <div className="text-center text-xs opacity-50 mb-2 uppercase tracking-tighter">
        Step {currentStep + 1} of {STEPS.length}
      </div>

      {/* Animated step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1 flex flex-col items-center justify-center px-6 py-6 text-center"
        >
          <div className="text-8xl mb-5 leading-none">{step.icon}</div>
          <motion.h1 
            className="text-3xl font-bold mb-3 leading-tight" 
            animate={{ color: step.color }}
          >
            {t(step.titleKey)}
          </motion.h1>
          <p className="text-base opacity-80 leading-relaxed max-w-[340px]">
            {t(step.subKey)}
          </p>
          <button
            onClick={() => speak(`${t(step.titleKey)}. ${t(step.subKey)}`)}
            className="mt-5 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white cursor-pointer text-sm"
          >
            🔊 Read aloud
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3 px-6 py-4 pb-8">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className={`flex-1 h-[60px] rounded-2xl text-base font-medium bg-transparent border border-white/20 text-white cursor-pointer transition-opacity ${currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
        >
          ← Back
        </button>
        <motion.button
          onClick={goNext}
          animate={{ backgroundColor: step.color }}
          className="flex-2 h-[60px] rounded-2xl text-base font-semibold text-white cursor-pointer border-none shadow-lg"
        >
          {currentStep === STEPS.length - 1 ? '✓ Done' : 'Next step →'}
        </motion.button>
      </div>
    </div>
  );
}
