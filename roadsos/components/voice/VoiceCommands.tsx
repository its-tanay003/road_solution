'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSStore } from '@/lib/store/sosStore';
import { useRouter } from 'next/navigation';
import { Mic, MicOff } from 'lucide-react';

type CommandAction = () => void;

export function VoiceCommands() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const { arm } = useSOSStore();

  const speak = useCallback((text: string) => {
    setFeedback(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.1;
      window.speechSynthesis.speak(utter);
    }
    setTimeout(() => setFeedback(''), 3000);
  }, []);

  const COMMANDS: Record<string, CommandAction> = {
    'open map': () => { router.push('/map'); speak('Opening map'); },
    'show map': () => { router.push('/map'); speak('Opening map'); },
    'open chat': () => { router.push('/chat'); speak('Opening AI assistant'); },
    'open first aid': () => { router.push('/first-aid'); speak('Opening first aid'); },
    'open directory': () => { router.push('/directory'); speak('Opening emergency directory'); },
    'open settings': () => { router.push('/settings'); speak('Opening settings'); },
    'go home': () => { router.push('/'); speak('Going home'); },
    'send sos': () => { arm('voice'); speak('SOS activated — sending emergency signal'); },
    'activate sos': () => { arm('voice'); speak('SOS activated'); },
    'call ambulance': () => { window.location.href = 'tel:108'; speak('Calling ambulance 108'); },
    'call police': () => { window.location.href = 'tel:100'; speak('Calling police 100'); },
    'call fire': () => { window.location.href = 'tel:101'; speak('Calling fire brigade 101'); },
    'call 112': () => { window.location.href = 'tel:112'; speak('Calling emergency 112'); },
    'dark mode': () => { document.documentElement.classList.toggle('dark'); speak('Theme toggled'); },
    'show commands': () => speak('Available: open map, open chat, send sos, call ambulance, call police, go home'),
  };

  const processCommand = useCallback((text: string) => {
    const lower = text.toLowerCase().trim();
    for (const [cmd, action] of Object.entries(COMMANDS)) {
      if (lower.includes(cmd)) {
        action();
        return;
      }
    }
    // Wake word without recognized command
    if (lower.includes('hey emergency') || lower.includes('sos help')) {
      speak('Listening for your command. Say "show commands" for options.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, arm, speak]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) return;
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const latest = e.results[e.results.length - 1];
      const text = latest[0].transcript;
      setTranscript(text);
      if (latest.isFinal) {
        processCommand(text);
        setTranscript('');
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => { if (listening) recognition.start(); };
    recognitionRef.current = recognition;
  }, [processCommand, listening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      speak('Voice commands not supported in this browser. Please use Chrome.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
      speak('Voice commands active. Say "Hey Emergency" followed by your command.');
    }
  };

  return (
    <>
      {/* Mic FAB */}
      <motion.button
        onClick={toggleListening}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 left-4 z-50 w-12 h-12 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: listening ? '#ef4444' : '#374151' }}
        aria-label={listening ? 'Stop voice commands' : 'Start voice commands'}
      >
        {listening ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
            <Mic size={20} className="text-white" />
          </motion.div>
        ) : (
          <MicOff size={20} className="text-gray-300" />
        )}
      </motion.button>

      {/* Waveform + transcript */}
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-40 left-4 z-50 bg-gray-900 border border-red-800 rounded-2xl px-4 py-3 max-w-[240px] shadow-xl"
          >
            <div className="flex items-end gap-0.5 mb-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-red-500 rounded-full"
                  animate={{ height: [4, ((i * 7) % 20) + 4, 4] }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </div>
            <p className="text-gray-300 text-xs">{transcript || 'Listening…'}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback bubble */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-gray-700 rounded-2xl px-5 py-2.5 text-white text-sm font-medium shadow-xl"
          >
            🎙️ {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
