import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Phone, 
  CheckCircle2, 
  MessageSquare,
  Share2,
  ChevronLeft,
  X,
  Clock,
  Heart,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useSosStore, useUserStore } from '../store';
import { useNavigate } from 'react-router-dom';

const STEP_COUNT = 6;

export const BystanderMode: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useSosStore();
  const { activeCountry } = useUserStore();
  const [step, setStep] = useState(1);
  const [victimStatus, setVictimStatus] = useState<'conscious' | 'unconscious' | null>(null);
  const [seconds, setSeconds] = useState(0);

  // Timer for Step 6
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (step === 6) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slightly slower for better clarity
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleNext = () => {
    if (step < STEP_COUNT) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  const shareLocation = () => {
    if (!location) return;
    const text = `I am at an accident scene. My location: https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Trigger speech on step change
  useEffect(() => {
    const messages: Record<number, string> = {
      1: "Are you safe to approach the scene?",
      2: "Call emergency services now.",
      3: "Can the victim speak to you?",
      4: victimStatus === 'unconscious' ? "Do not move the victim. Check for breathing." : "Apply pressure to bleeding wounds with cloth. Keep them calm.",
      5: "Share your location with emergency services.",
      6: "Stay with the victim and keep them talking."
    };
    if (messages[step]) speak(messages[step]);
  }, [step, victimStatus, speak]);

  const progress = (step / STEP_COUNT) * 100;

  return (
    <div className="fixed inset-0 z-2000 bg-(--app-bg) text-(--app-text) flex flex-col font-sans overflow-hidden">
      {/* Progress Bar */}
      <div className="h-4 w-full bg-navy/10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', damping: 20 }}
          className="h-full bg-amber shadow-[0_0_20px_rgba(245,124,0,0.5)]"
        />
      </div>

      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between bg-(--app-surface) border-b-4 border-(--app-border)">
        <button 
          onClick={handleBack} 
          className="h-16 px-6 bg-navy/10 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-sm active:scale-95 transition-transform"
        >
          <ChevronLeft size={28} /> BACK
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-black uppercase tracking-[0.3em] opacity-40">PROTOCOL</span>
          <span className="text-xl font-black">{step} / {STEP_COUNT}</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          title="Exit Bystander Mode"
          className="h-16 w-16 bg-emergency/10 text-[var(--color-emergency)] rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <X size={32} strokeWidth={3} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            {step === 1 && (
              <div className="space-y-10 text-center flex-1 flex flex-col justify-center">
                <div className="w-32 h-32 bg-amber/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-amber/20">
                  <ShieldAlert size={64} className="text-amber" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">Are you safe?</h2>
                <div className="grid gap-6 mt-auto">
                  <button 
                    onClick={handleNext}
                    className="w-full h-28 bg-[var(--color-safe)] text-white rounded-4xl text-3xl font-black uppercase tracking-tighter shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
                  >
                    <CheckCircle2 size={40} />
                    YES, I AM SAFE
                  </button>
                  <button 
                    onClick={() => speak("Stay back. Call emergency services now.")}
                    className="w-full h-24 bg-(--app-surface) border-4 border-[var(--color-emergency)] text-[var(--color-emergency)] rounded-4xl text-2xl font-black uppercase tracking-tighter active:scale-95 transition-transform"
                  >
                    NO, I AM AT RISK
                  </button>
                </div>
                
                {activeCountry.code === 'IN' && (
                  <div className="mt-8 p-6 bg-navy/5 border-4 border-navy/10 rounded-4xl text-left flex items-start gap-4">
                    <ShieldCheck size={32} className="text-navy shrink-0" />
                    <div>
                      <p className="text-sm font-black text-navy uppercase tracking-widest mb-1">Good Samaritan Law</p>
                      <p className="text-base font-bold opacity-70 leading-snug">
                        You are legally protected from harassment. Focus on saving a life.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 text-center flex-1 flex flex-col justify-center">
                <div className="w-32 h-32 bg-emergency/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-[var(--color-emergency)]/20">
                  <Phone size={64} className="text-[var(--color-emergency)] animate-pulse" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">Call for Help</h2>
                <a 
                  href={`tel:${activeCountry.code === 'IN' ? '112' : activeCountry.emergencyNumbers.main}`}
                  className="w-full py-12 bg-[var(--color-emergency)] text-white rounded-[3rem] text-5xl font-black uppercase tracking-tighter shadow-2xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  CALL {activeCountry.code === 'IN' ? '112' : activeCountry.emergencyNumbers.main}
                  <span className="text-lg opacity-80 tracking-widest font-black uppercase">Tap to Dial</span>
                </a>
                <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Dispatcher on the way...</p>
                <button 
                  onClick={handleNext}
                  className="mt-auto w-full h-24 bg-navy text-white rounded-4xl text-3xl font-black uppercase tracking-tighter active:scale-95 transition-transform"
                >
                  I'VE CALLED
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 text-center flex-1 flex flex-col justify-center">
                <div className="w-32 h-32 bg-navy/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-navy/20">
                  <Eye size={64} className="text-navy" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">Victim Status?</h2>
                <div className="grid gap-6 mt-auto">
                  <button 
                    onClick={() => { setVictimStatus('conscious'); handleNext(); }}
                    className="w-full h-28 bg-[var(--color-safe)] text-white rounded-4xl text-3xl font-black uppercase tracking-tighter active:scale-95 transition-transform"
                  >
                    CONSCIOUS
                  </button>
                  <button 
                    onClick={() => { setVictimStatus('unconscious'); handleNext(); }}
                    className="w-full h-28 bg-[var(--color-emergency)] text-white rounded-4xl text-3xl font-black uppercase tracking-tighter active:scale-95 transition-transform"
                  >
                    UNCONSCIOUS
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 flex-1 flex flex-col">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-16 h-16 bg-safe/10 rounded-3xl flex items-center justify-center border-4 border-[var(--color-safe)]/20">
                    <Heart size={32} className="text-[var(--color-safe)]" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic">First Aid</h2>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                  {victimStatus === 'unconscious' ? (
                    <>
                      <div className="p-8 bg-emergency/10 border-4 border-[var(--color-emergency)]/20 rounded-[2.5rem]">
                        <p className="text-3xl font-black text-[var(--color-emergency)] leading-none mb-3 uppercase italic">Don't Move Them</p>
                        <p className="text-xl font-bold opacity-70">Unless there is a fire or immediate danger.</p>
                      </div>
                      <div className="p-8 bg-navy/5 border-4 border-navy/10 rounded-[2.5rem]">
                        <p className="text-3xl font-black text-navy leading-none mb-3 uppercase italic">Check Breath</p>
                        <p className="text-xl font-bold opacity-70">Look for chest movement. Keep airway clear.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-8 bg-amber/10 border-4 border-amber/20 rounded-[2.5rem]">
                        <p className="text-3xl font-black text-amber leading-none mb-3 uppercase italic">Apply Pressure</p>
                        <p className="text-xl font-bold opacity-70">Use a clean cloth. Press firm on bleeding areas.</p>
                      </div>
                      <div className="p-8 bg-navy/5 border-4 border-navy/10 rounded-[2.5rem]">
                        <p className="text-3xl font-black text-navy leading-none mb-3 uppercase italic">Keep Talking</p>
                        <p className="text-xl font-bold opacity-70">Ask their name. Don't let them sleep.</p>
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={handleNext}
                  className="mt-6 w-full h-24 bg-navy text-white rounded-4xl text-3xl font-black uppercase tracking-tighter flex items-center justify-center gap-4 active:scale-95 transition-transform"
                >
                  UNDERSTOOD <ArrowRight size={32} strokeWidth={3} />
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-10 text-center flex-1 flex flex-col justify-center">
                <div className="w-32 h-32 bg-safe/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-[var(--color-safe)]/20">
                  <Share2 size={64} className="text-[var(--color-safe)]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">Share Location</h2>
                <div className="p-8 bg-(--app-surface) rounded-[2.5rem] border-4 border-(--app-border) shadow-inner">
                  <p className="text-sm font-black opacity-30 uppercase tracking-[0.3em] mb-3">GPS COORDINATES</p>
                  <p className="text-3xl font-mono font-black tracking-tighter text-navy">
                    {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                  </p>
                </div>
                <button 
                  onClick={shareLocation}
                  className="w-full h-28 bg-[var(--color-safe)] text-white rounded-4xl text-3xl font-black uppercase tracking-tighter shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
                >
                  <MessageSquare size={40} />
                  WHATSAPP INFO
                </button>
                <button 
                  onClick={handleNext}
                  className="mt-auto w-full h-20 bg-navy/10 text-navy rounded-4xl text-2xl font-black uppercase tracking-tighter active:scale-95 transition-transform"
                >
                  CONTINUE
                </button>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-10 flex-1 flex flex-col text-center">
                <div className="space-y-6 py-8">
                  <div className="w-24 h-24 bg-navy/5 rounded-full flex items-center justify-center mx-auto">
                    <Clock size={48} className="text-navy opacity-30 animate-spin-slow" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">Stay Present</h2>
                  <p className="text-2xl font-bold opacity-60">You are doing great. Help is coming.</p>
                </div>

                <div className="flex-1 flex flex-col justify-center py-10">
                  <p className="text-sm font-black opacity-30 uppercase tracking-[0.4em] mb-4">ASSISTANCE TIME</p>
                  <p className="text-8xl font-black tracking-tighter tabular-nums text-navy">
                    {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    speak("Thank you for helping. You may have saved a life.");
                    navigate('/');
                  }}
                  className="mt-auto w-full h-28 bg-[var(--color-emergency)] text-white rounded-4xl text-3xl font-black uppercase tracking-tighter shadow-2xl active:scale-95 transition-transform"
                >
                  END SESSION
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Hint */}
      <footer className="px-8 py-8 bg-(--app-surface) border-t-4 border-(--app-border) text-center">
        <p className="text-xs font-black opacity-30 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
          <ShieldCheck size={20} className="text-[var(--color-safe)]" />
          BYSTANDER PROTOCOL v1.0 • ENFORCED
        </p>
      </footer>
    </div>
  );
};
