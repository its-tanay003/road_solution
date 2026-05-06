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
        style={{ textAlign: 'center', padding: '3rem 1rem', maxWidth: 480, margin: '0 auto' }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: '#00E676', marginBottom: 8, fontSize: 22 }}>
          Well done. You helped save a life.
        </h2>
        <p style={{ opacity: 0.7, marginBottom: 24, lineHeight: 1.6 }}>
          India's Good Samaritan Guidelines 2015 protect you.
          You cannot be penalized for helping in good faith.
        </p>
        <button
          onClick={() => { setCurrentStep(0); setCompleted(false); }}
          style={{
            padding: '12px 32px', borderRadius: 12,
            background: '#1D9E75', color: '#fff', border: 'none',
            fontSize: 16, cursor: 'pointer', fontWeight: 600,
          }}
        >
          Start over
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', maxWidth: 480, margin: '0 auto' }}>
      {/* Good Samaritan Banner */}
      <div style={{
        background: '#E65100', padding: '10px 16px', fontSize: 12, color: '#fff',
        borderRadius: '0 0 12px 12px', textAlign: 'center', margin: '0 16px',
      }}>
        India's Good Samaritan Law 2015 protects you — you are legally safe to help.
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            style={{
              width: i === currentStep ? 24 : 8, height: 8, borderRadius: 4,
              background: i < currentStep ? '#00E676' : i === currentStep ? step.color : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, opacity: 0.5, marginBottom: 8 }}>
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
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px 24px', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 88, marginBottom: 20, lineHeight: 1 }}>{step.icon}</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: step.color, marginBottom: 10, lineHeight: 1.2 }}>
            {t(step.titleKey)}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.7, maxWidth: 340 }}>
            {t(step.subKey)}
          </p>
          <button
            onClick={() => speak(`${t(step.titleKey)}. ${t(step.subKey)}`)}
            style={{
              marginTop: 20, padding: '8px 20px', borderRadius: 20,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer', fontSize: 13,
            }}
          >
            🔊 Read aloud
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 12, padding: '16px 24px 32px' }}>
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          style={{
            flex: 1, height: 60, borderRadius: 16, fontSize: 16, fontWeight: 500,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.3 : 1, transition: 'opacity 0.2s',
          }}
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          style={{
            flex: 2, height: 60, borderRadius: 16, fontSize: 16, fontWeight: 600,
            background: step.color, border: 'none', color: '#fff', cursor: 'pointer',
          }}
        >
          {currentStep === STEPS.length - 1 ? '✓ Done' : 'Next step →'}
        </button>
      </div>
    </div>
  );
}
