import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { announce } from '../lib/accessibilityHelpers';

/** Voice command → route mapping */
const COMMANDS: Array<{ phrases: string[]; action: (nav: ReturnType<typeof useNavigate>) => void; label: string }> = [
  { phrases: ['go home', 'open home', 'home'],             action: n => n('/'),                 label: 'Home' },
  { phrases: ['open map', 'show map', 'live map', 'map'],  action: n => n('/map'),              label: 'Map' },
  { phrases: ['open assistant', 'ai help', 'help me', 'ask ai'], action: n => n('/assistant'), label: 'AI Help' },
  { phrases: ['open profile', 'my profile', 'profile'],    action: n => n('/profile'),          label: 'Profile' },
  { phrases: ['open settings', 'settings'],                action: n => n('/settings'),         label: 'Settings' },
  { phrases: ['first aid', 'open first aid'],              action: n => n('/first-aid'),        label: 'First Aid Guide' },
  { phrases: ['emergency contacts', 'my contacts'],        action: n => n('/emergency-contacts'), label: 'Emergency Contacts' },
  { phrases: ['medical records', 'my medical', 'medical'], action: n => n('/medical'),          label: 'Medical Records' },
  { phrases: ['hospitals', 'find hospital', 'nearest hospital'], action: n => n('/hospitals'),  label: 'Hospitals' },
  { phrases: ['sos', 'help me sos', 'emergency', 'help me roadsos'],          action: n => n('/sos-active'),       label: 'SOS' },
  { phrases: ['go back', 'back'],                          action: n => n(-1 as number),           label: 'back' },
];

/** Fuzzy match — checks if transcript contains any phrase */
function matchCommand(transcript: string): typeof COMMANDS[number] | null {
  const lower = transcript.toLowerCase().trim();
  for (const cmd of COMMANDS) {
    if (cmd.phrases.some(p => lower.includes(p))) return cmd;
  }
  return null;
}

export function VoiceNavigationListener() {
  const navigate = useNavigate();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startListeningRef = useRef<() => void>(() => {});

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return; // Not supported — fail silently

    if (isListeningRef.current) return;

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous    = true;
    recognition.interimResults = false;
    recognition.lang           = 'en-IN'; // India English, better accent recognition

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const last = results[results.length - 1];
      if (!last.isFinal) return;

      // Check all alternatives for best match
      for (let i = 0; i < last.length; i++) {
        const transcript = last[i].transcript;
        const cmd = matchCommand(transcript);
        if (cmd) {
          announce(`Voice command: ${cmd.label}`, 'assertive');
          cmd.action(navigate);
          return;
        }
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      // Auto-restart after 500ms so it stays always-on
      restartTimerRef.current = setTimeout(() => {
        startListeningRef.current();
      }, 500);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      // 'no-speech' and 'aborted' are normal — don't spam console
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('[VoiceNav] Error:', e.error);
      }
      isListeningRef.current = false;
    };

    try {
      recognition.start();
      isListeningRef.current = true;
      recognitionRef.current = recognition;
    } catch {
      isListeningRef.current = false;
    }
  }, [navigate]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  useEffect(() => {
    // Only start if browser supports it
    const supported = !!(
      window.SpeechRecognition || window.webkitSpeechRecognition
    );
    if (!supported) return;

    // Delay first start — let app finish mounting
    const init = setTimeout(() => startListening(), 1500);

    return () => {
      clearTimeout(init);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      isListeningRef.current = false;
    };
  }, [startListening]);

  // Renders nothing — pure behaviour component
  return null;
}
