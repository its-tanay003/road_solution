'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSOSStore } from '@/lib/store/sosStore';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Volume2, HelpCircle, X, ShieldAlert, Sparkles, HelpCircle as HelpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  gu: 'gu-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
  pt: 'pt-BR',
  zh: 'zh-CN',
  bn: 'bn-IN',
  ru: 'ru-RU',
};

const LANG_NAME_TO_CODE: Record<string, string> = {
  hindi: 'hi',
  gujarati: 'gu',
  spanish: 'es',
  french: 'fr',
  arabic: 'ar',
  portuguese: 'pt',
  chinese: 'zh',
  bengali: 'bn',
  russian: 'ru',
  english: 'en',
};

export function VoiceCommands() {
  const { i18n, t } = useTranslation();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isWhisperRecording, setIsWhisperRecording] = useState(false);
  const [whisperLoading, setWhisperLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const router = useRouter();
  const { arm } = useSOSStore();

  const speak = useCallback((text: string) => {
    setFeedback(text);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.1;
      utter.lang = LANGUAGE_LOCALE_MAP[i18n.language] || 'en-US';
      window.speechSynthesis.speak(utter);
    }
    setTimeout(() => setFeedback(''), 4000);
  }, [i18n.language]);

  // Execute Voice Command Actions
  const executeCommand = useCallback((lower: string) => {
    // 1. SOS commands
    if (
      lower.includes('send sos') ||
      lower.includes('activate sos') ||
      lower.includes('activate panic mode') ||
      lower.includes('panic mode')
    ) {
      arm('voice');
      speak(t('SOS activated — broadcasting emergency beacon'));
      return true;
    }

    // 2. Navigation commands
    if (lower.includes('open map') || lower.includes('show map')) {
      router.push('/map');
      speak(t('Opening emergency map'));
      return true;
    }
    if (lower.includes('find nearest hospital') || lower.includes('nearest hospital')) {
      router.push('/map?find=hospital');
      speak(t('Locating nearest hospital on the map'));
      return true;
    }
    if (lower.includes('open chat') || lower.includes('open chatbot') || lower.includes('open assistant')) {
      router.push('/chat');
      speak(t('Opening AI chat assistant'));
      return true;
    }
    if (lower.includes('open first aid') || lower.includes('first aid')) {
      router.push('/first-aid');
      speak(t('Opening first aid guidelines'));
      return true;
    }
    if (lower.includes('open directory') || lower.includes('emergency contacts')) {
      router.push('/directory');
      speak(t('Opening emergency phone directory'));
      return true;
    }
    if (lower.includes('open settings') || lower.includes('settings')) {
      router.push('/settings');
      speak(t('Opening profile settings'));
      return true;
    }
    if (lower.includes('go home') || lower.includes('open dashboard') || lower.includes('go back')) {
      router.push('/');
      speak(t('Opening main driver dashboard'));
      return true;
    }

    // 3. Dialing commands
    if (lower.includes('call 108') || lower.includes('call ambulance')) {
      window.location.href = 'tel:108';
      speak(t('Calling emergency ambulance 108'));
      return true;
    }
    if (lower.includes('call police') || lower.includes('call 100')) {
      window.location.href = 'tel:100';
      speak(t('Calling police department'));
      return true;
    }
    if (lower.includes('call fire') || lower.includes('call 101')) {
      window.location.href = 'tel:101';
      speak(t('Calling fire brigade emergency'));
      return true;
    }
    if (lower.includes('call 112') || lower.includes('call help')) {
      window.location.href = 'tel:112';
      speak(t('Calling national emergency line 112'));
      return true;
    }

    // 4. Language selection commands
    for (const [langName, langCode] of Object.entries(LANG_NAME_TO_CODE)) {
      if (lower.includes(`switch language to ${langName}`) || lower.includes(`change language to ${langName}`)) {
        void i18n.changeLanguage(langCode);
        speak(`Language switched to ${langName}`);
        return true;
      }
    }

    // 5. Help overlay trigger
    if (lower.includes('show commands') || lower.includes('help commands') || lower.includes('voice help')) {
      setShowHelp(true);
      speak(t('Displaying available voice commands overlay'));
      return true;
    }
    if (lower.includes('close commands') || lower.includes('hide commands') || lower.includes('dismiss commands')) {
      setShowHelp(false);
      speak(t('Dismissed help commands'));
      return true;
    }

    return false;
  }, [router, arm, speak, i18n, t]);

  // Main command processing logic (Local Speech + Whisper results)
  const processTranscript = useCallback((text: string) => {
    const lower = text.toLowerCase().trim();
    
    // Check if command executes
    const handled = executeCommand(lower);
    if (handled) return;

    // Wake word response if no command matches
    if (lower.includes('hey emergency') || lower.includes('sos help')) {
      speak(t('Listening. Say "Show commands" or give a navigation instruction.'));
    }
  }, [executeCommand, speak, t]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    const w = window as any;
    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) return;

    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANGUAGE_LOCALE_MAP[i18n.language] || 'en-US';

    recognition.onresult = (e: any) => {
      const latest = e.results[e.results.length - 1];
      const text = latest[0].transcript;
      setTranscript(text);
      if (latest.isFinal) {
        processTranscript(text);
        setTranscript('');
      }
    };

    recognition.onerror = (err: any) => {
      console.error('[Voice] Recognition error:', err);
      // Don't auto-stop on quiet breaks
      if (err.error !== 'no-speech') {
        setListening(false);
      }
    };

    recognition.onend = () => {
      if (listening && !isWhisperRecording) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    if (listening && !isWhisperRecording) {
      try {
        recognition.start();
      } catch {}
    }

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [listening, i18n.language, isWhisperRecording, processTranscript]);

  const toggleListening = () => {
    if (listening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setListening(false);
      setTranscript('');
    } else {
      setListening(true);
      speak(t('Voice navigator active. Speak wake word "Hey Emergency" or navigation commands.'));
    }
  };

  // ── OpenAI Whisper Recording Fallback ──────────────────────────────
  const startWhisperRecording = async () => {
    try {
      // Pause local recognition during recording to avoid conflicts
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await uploadAudioToWhisper(audioBlob);
        
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());

        // Resume local recognition if active
        if (listening) {
          try {
            recognitionRef.current.start();
          } catch {}
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.start();
      setIsWhisperRecording(true);
      speak(t('Whisper recording... speak your command.'));
    } catch (err) {
      console.error('Failed to start Whisper recording:', err);
      speak(t('Microphone access denied.'));
    }
  };

  const stopWhisperRecording = () => {
    if (mediaRecorderRef.current && isWhisperRecording) {
      mediaRecorderRef.current.stop();
      setIsWhisperRecording(false);
    }
  };

  const uploadAudioToWhisper = async (blob: Blob) => {
    setWhisperLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.wav');

      const res = await fetch('/api/voice/whisper', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Whisper server failed');
      const data = await res.json();
      const text = data.text;
      
      if (text) {
        setTranscript(text);
        speak(`Whisper parsed: "${text}"`);
        setTimeout(() => {
          processTranscript(text);
          setTranscript('');
        }, 1500);
      } else {
        speak(t('Could not transcribe audio.'));
      }
    } catch (err) {
      console.error('Whisper transcription error:', err);
      speak(t('Whisper link failed. Using local recognition.'));
    } finally {
      setWhisperLoading(false);
    }
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
  };

  return (
    <>
      {/* Voice Controls Bar */}
      <div className="fixed bottom-24 left-4 z-40 flex items-center gap-2">
        {/* Local Web Speech Trigger */}
        <motion.button
          onClick={toggleListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border text-white transition-all',
            listening ? 'bg-red-600 border-red-500' : 'bg-gray-900 border-gray-800 hover:border-gray-700'
          )}
          aria-label={listening ? 'Disable Voice Navigation' : 'Enable Voice Navigation'}
        >
          {listening ? (
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
              <Mic size={18} />
            </motion.div>
          ) : (
            <MicOff size={18} className="text-gray-400" />
          )}
        </motion.button>

        {/* Whisper Press-to-Speak Trigger */}
        <motion.button
          onMouseDown={startWhisperRecording}
          onMouseUp={stopWhisperRecording}
          onTouchStart={startWhisperRecording}
          onTouchEnd={stopWhisperRecording}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border text-white transition-all',
            isWhisperRecording
              ? 'bg-purple-600 border-purple-500 animate-pulse'
              : whisperLoading
              ? 'bg-purple-900 border-purple-800'
              : 'bg-gray-900 border-gray-800 hover:border-purple-900'
          )}
          title="Hold for Whisper Transcription (OpenAI)"
          aria-label="Hold to speak with Whisper"
        >
          {whisperLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={18} className={cn(isWhisperRecording ? 'text-white' : 'text-purple-400')} />
          )}
        </motion.button>

        {/* Help overlay trigger */}
        <motion.button
          onClick={handleHelpClick}
          whileHover={{ scale: 1.05 }}
          className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white"
          title="Show voice commands list"
        >
          <HelpIcon size={14} />
        </motion.button>
      </div>

      {/* Pulse / Waveform Overlay when active */}
      <AnimatePresence>
        {(listening || isWhisperRecording) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-38 left-4 z-40 bg-gray-950/90 border border-gray-800 rounded-3xl p-4 w-[280px] shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-red-500">
                {isWhisperRecording ? 'Whisper Rec' : 'Voice Command'}
              </span>
              {/* Waveform indicator */}
              <div className="flex items-end gap-0.5 h-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn('w-0.5 rounded-full', isWhisperRecording ? 'bg-purple-500' : 'bg-red-500')}
                    animate={{ height: [3, Math.max(3, (isWhisperRecording ? 14 : 9) - (i % 3) * 3), 3] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.04,
                    }}
                  />
                ))}
              </div>
            </div>
            
            <p className="text-white text-xs font-medium leading-relaxed italic">
              {transcript ? `"${transcript}"` : t('Listening for "Hey Emergency"...')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 border border-red-500/30 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-full shadow-2xl backdrop-blur flex items-center gap-2"
          >
            <Volume2 size={13} className="text-red-500 animate-bounce" />
            <span>{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Help Overlay Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-950 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-900">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-red-500" size={18} />
                  <h3 className="text-white font-black text-sm tracking-tight">Voice Command Assistant</h3>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-900 transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Commands List */}
              <div className="p-5 max-h-[350px] overflow-y-auto space-y-4">
                <p className="text-gray-400 text-xs leading-relaxed">
                  Toggle voice navigation using the mic button, then say the wake word <strong className="text-red-400">"Hey Emergency"</strong> followed by any of the commands listed below.
                </p>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">SOS Operations</h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Arm Panic Mode</span>
                      <strong className="text-white font-mono">"Send SOS" / "Activate SOS"</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Navigation & Views</h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Open Map</span>
                      <strong className="text-white font-mono">"Open Map" / "Show Map"</strong>
                    </div>
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Search Hospitals</span>
                      <strong className="text-white font-mono">"Find nearest hospital"</strong>
                    </div>
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Launch AI Assistant</span>
                      <strong className="text-white font-mono">"Open Chat"</strong>
                    </div>
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">First Aid Guidelines</span>
                      <strong className="text-white font-mono">"First Aid"</strong>
                    </div>
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Home Dashboard</span>
                      <strong className="text-white font-mono">"Go Home"</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hotlines (Auto-Call)</h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Ambulance</span>
                      <strong className="text-white font-mono">"Call 108" / "Call Ambulance"</strong>
                    </div>
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Police Dispatcher</span>
                      <strong className="text-white font-mono">"Call Police" / "Call 100"</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Multilingual Settings</h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="bg-gray-900 px-3 py-2 rounded-xl border border-gray-850 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Switch Locale</span>
                      <strong className="text-white font-mono">"Switch language to Hindi"</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-900/60 p-4 border-t border-gray-900 text-center text-[10px] text-gray-500">
                To close, click the X or say <strong className="text-gray-400">"Close commands"</strong>.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
