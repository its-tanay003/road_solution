import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Languages, Shield, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { requestSensorPermissions } from '../hooks/useSensors';

const LANGUAGES = [
  { id: 'en', label: 'English', sub: 'Standard' },
  { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
  { id: 'ta', label: 'தமிழ்', sub: 'Tamil' },
  { id: 'te', label: 'తెలుగు', sub: 'Telugu' },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isTriggered, setIsTriggered] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const { isListening, start, stop, transcript, error } = useVoiceRecognition((command) => {
    if (command.includes('help me roadsos') || command.includes('help me road sos')) {
      setIsTriggered(true);
    }
  });

  const handlePermissionRequest = async () => {
    const granted = await requestSensorPermissions();
    setPermissionsGranted(granted);
    if (granted) {
      setStep(2);
    } else {
      // Fallback or alert if denied
      setStep(2); // Still proceed but sensors might not work
    }
  };

  // Auto-voice greeting based on step
  useEffect(() => {
    if (step === 2) {
      const speech = new SpeechSynthesisUtterance("Voice setup. Please say Help me ROADSoS to test your emergency trigger.");
      window.speechSynthesis.speak(speech);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col px-8 pt-24">
            <Languages className="text-amber-400 mb-6" size={48} />
            <h1 className="text-4xl font-black text-white leading-tight mb-4">Choose your language</h1>
            <p className="text-white/40 mb-12">ROADSoS will speak to you in this language during emergencies.</p>
            
            <div className="space-y-3 flex-1">
              {LANGUAGES.map(lang => (
                <button key={lang.id} onClick={() => setSelectedLang(lang.id)}
                  className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all ${selectedLang === lang.id ? 'bg-amber-400/10 border-amber-400' : 'bg-white/4 border-white/8'}`}>
                  <div className="text-left">
                    <p className={`text-xl font-bold ${selectedLang === lang.id ? 'text-white' : 'text-white/60'}`}>{lang.label}</p>
                    <p className="text-[12px] text-white/30">{lang.sub}</p>
                  </div>
                  {selectedLang === lang.id && <Check className="text-amber-400" />}
                </button>
              ))}
            </div>

            <button onClick={handlePermissionRequest} className="w-full h-16 rounded-2xl bg-white text-black font-black text-lg mb-12 flex items-center justify-center gap-2">
              Continue <ChevronRight size={20} />
            </button>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col px-8 pt-24 items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl transition-all ${isTriggered ? 'bg-green-500 shadow-green-500/20' : 'bg-amber-400 shadow-amber-400/20'}`}>
              {isTriggered ? <Check size={40} className="text-black" /> : <Mic size={40} className="text-black" />}
            </div>
            <h1 className="text-3xl font-black text-white mb-4">{isTriggered ? "Voice Verified" : "Voice Setup"}</h1>
            <p className="text-white/40 mb-12 px-4 text-lg">
              {isTriggered 
                ? "Excellent. The system now recognizes your voice trigger."
                : <span>In an emergency, just say <span className="text-amber-400 font-bold">'Help me ROADSoS'</span> to trigger an alert.</span>
              }
            </p>

            <div className="w-full max-w-xs aspect-square rounded-full border-2 border-dashed border-white/10 flex items-center justify-center relative">
              <motion.div animate={{ scale: isListening ? [1, 1.2, 1] : 1, opacity: isListening ? [0.3, 0.6, 0.3] : 0.1 }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-amber-400/10 rounded-full" />
              <button onClick={() => isListening ? stop() : start()}
                className={`z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isListening ? 'bg-red-500 scale-110' : 'bg-white/5'}`}>
                <Mic size={32} className={isListening ? 'text-white' : 'text-white/40'} />
              </button>
            </div>

            <p className="mt-8 text-white/30 font-medium italic min-h-[1.5em]">
              {error ? <span className="text-red-500/60">{error}</span> : isListening ? (transcript || "Listening...") : "Tap the mic and try saying it"}
            </p>

            <div className="mt-auto w-full pb-12 space-y-4">
              <button onClick={() => navigate('/')} disabled={!isTriggered}
                className={`w-full h-16 rounded-2xl font-black text-lg transition-all ${isTriggered ? 'bg-amber-400 text-black' : 'bg-white/5 text-white/20'}`}>
                Complete Setup
              </button>
              <button onClick={() => setStep(1)} className="text-white/20 font-bold uppercase tracking-widest text-[11px]">
                Back
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
