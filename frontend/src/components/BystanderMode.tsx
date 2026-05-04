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
import { useUIStore, useSosStore, useUserStore } from '../store';

const STEP_COUNT = 6;

export const BystanderMode: React.FC = () => {
  const { setUxMode } = useUIStore();
  const { location } = useSosStore();
  const { activeCountry } = useUserStore();
  const [step, setStep] = useState(1);
  const [victimStatus, setVictimStatus] = useState<'conscious' | 'unconscious' | null>(null);
  const [seconds, setSeconds] = useState(0);

  // Timer for Step 6
  useEffect(() => {
    let interval: any;
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
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleNext = () => {
    if (step < STEP_COUNT) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else setUxMode('DEFAULT');
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
    <div className="fixed inset-0 z-1000 bg-white text-black flex flex-col font-sans">
      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-amber-500"
        />
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs tracking-widest">
          <ChevronLeft size={20} /> Back
        </button>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Step {step} of {STEP_COUNT}
        </span>
        <button onClick={() => setUxMode('DEFAULT')} title="Close Bystander Mode" className="p-2 text-slate-400 hover:text-black transition-colors">
          <X size={20} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-10 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            {step === 1 && (
              <div className="space-y-8 text-center flex-1 flex flex-col justify-center">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert size={48} className="text-amber-600" />
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-tight">Are you safe to approach the scene?</h2>
                <div className="grid gap-4 mt-auto">
                  <button 
                    onClick={handleNext}
                    className="w-full py-6 bg-black text-white rounded-3xl text-xl font-black uppercase tracking-tighter shadow-xl flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 size={24} />
                    Yes — I am safe
                  </button>
                  <button 
                    onClick={() => speak("Stay back. Call emergency services now.")}
                    className="w-full py-6 bg-white border-2 border-black text-black rounded-3xl text-xl font-black uppercase tracking-tighter"
                  >
                    No — I am at risk
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 text-center flex-1 flex flex-col justify-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                  <Phone size={48} className="text-red-600 animate-pulse" />
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-tight">Call emergency services first</h2>
                <a 
                  href={`tel:${activeCountry.emergencyNumbers.main}`}
                  className="w-full py-10 bg-red-600 text-white rounded-[2.5rem] text-4xl font-black uppercase tracking-tighter shadow-2xl flex flex-col items-center gap-2"
                >
                  CALL {activeCountry.emergencyNumbers.main} NOW
                  <span className="text-sm opacity-70 tracking-widest font-bold">One-tap dialer</span>
                </a>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">While waiting for the dispatcher...</p>
                <button 
                  onClick={handleNext}
                  className="mt-auto w-full py-6 bg-black text-white rounded-3xl text-xl font-black uppercase tracking-tighter"
                >
                  I've Called
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 text-center flex-1 flex flex-col justify-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <Eye size={48} className="text-blue-600" />
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-tight">Can the victim speak to you?</h2>
                <div className="grid gap-4 mt-auto">
                  <button 
                    onClick={() => { setVictimStatus('conscious'); handleNext(); }}
                    className="w-full py-6 bg-black text-white rounded-3xl text-xl font-black uppercase tracking-tighter"
                  >
                    Yes — Conscious
                  </button>
                  <button 
                    onClick={() => { setVictimStatus('unconscious'); handleNext(); }}
                    className="w-full py-6 bg-white border-2 border-black text-black rounded-3xl text-xl font-black uppercase tracking-tighter"
                  >
                    No — Unconscious
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Heart size={24} className="text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight uppercase italic">Guided First Aid</h2>
                </div>

                <div className="space-y-6">
                  {victimStatus === 'unconscious' ? (
                    <>
                      <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl">
                        <p className="text-xl font-black text-red-900 leading-tight mb-2">DO NOT MOVE THE VICTIM</p>
                        <p className="text-slate-600 font-medium">Unless there is immediate danger of fire or explosion.</p>
                      </div>
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                        <p className="text-xl font-black text-slate-900 leading-tight mb-2">CHECK BREATHING</p>
                        <p className="text-slate-600 font-medium">Tilt head back slightly and look for chest movement.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-3xl">
                        <p className="text-xl font-black text-amber-900 leading-tight mb-2">APPLY PRESSURE</p>
                        <p className="text-slate-600 font-medium">Use a clean cloth to apply firm pressure to any bleeding wounds.</p>
                      </div>
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                        <p className="text-xl font-black text-slate-900 leading-tight mb-2">KEEP THEM TALKING</p>
                        <p className="text-slate-600 font-medium">Keep them calm and focused on your voice. Do not let them sleep.</p>
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={handleNext}
                  className="mt-auto w-full py-6 bg-black text-white rounded-3xl text-xl font-black uppercase tracking-tighter flex items-center justify-center gap-3"
                >
                  Understood <ArrowRight size={24} />
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 text-center flex-1 flex flex-col justify-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <Share2 size={48} className="text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-tight">Help responders find you</h2>
                <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Your Current GPS</p>
                  <p className="text-2xl font-mono font-black tracking-tighter">
                    {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                  </p>
                </div>
                <button 
                  onClick={shareLocation}
                  className="w-full py-6 bg-emerald-600 text-white rounded-3xl text-xl font-black uppercase tracking-tighter shadow-xl flex items-center justify-center gap-3"
                >
                  <MessageSquare size={24} />
                  Share via WhatsApp
                </button>
                <button 
                  onClick={handleNext}
                  className="mt-auto w-full py-6 bg-black text-white rounded-3xl text-xl font-black uppercase tracking-tighter"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-8 flex-1 flex flex-col">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock size={32} className="text-slate-400" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">Stay with the victim</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Emergency services are en route</p>
                </div>

                <div className="grid gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Talking Prompt</p>
                    <p className="font-bold text-lg">"What is your name? Can you hear me?"</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Observation</p>
                    <p className="font-bold text-lg">"Look for changes in breathing or color."</p>
                  </div>
                </div>

                <div className="mt-auto py-10 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">You have been helping for</p>
                  <p className="text-6xl font-black tracking-tighter tabular-nums">
                    {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    speak("Thank you for helping. You may have saved a life.");
                    setUxMode('DEFAULT');
                  }}
                  className="w-full py-6 bg-black text-white rounded-3xl text-xl font-black uppercase tracking-tighter"
                >
                  End Session
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Hint */}
      <footer className="px-8 py-6 bg-slate-50 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck size={12} className="text-emerald-500" />
          ROADSoS Bystander Protocol — v1.0
        </p>
      </footer>
    </div>
  );
};
