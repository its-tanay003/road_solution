import { useEffect, useRef } from 'react';
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

let voiceNavStarted = false;  // Module-level guard — only start once ever
let permissionDenied = false; // Module-level — once denied, stay denied

export function VoiceNavigationListener() {
  const navigate = useNavigate();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    function startRecognition(SpeechRec: SpeechRecognitionConstructor) {
      let errorCount = 0;
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        if (e.error === 'not-allowed') {
          if (errorCount === 0) {
            console.info('[VoiceNav] Microphone not allowed — voice commands disabled');
          }
          permissionDenied = true;
          errorCount++;
          rec.stop();
          return;
        }
        if (e.error === 'no-speech') return; // Normal — ignore completely
        if (errorCount < 2) console.warn('[VoiceNav] Error:', e.error);
        errorCount++;
      };

      rec.onend = () => {
        if (!permissionDenied) {
          // Restart with delay to avoid rapid cycling
          setTimeout(() => {
            try {
              if (!permissionDenied) rec.start();
            } catch { /* ignore */ }
          }, 3000);
        }
      };

      rec.onresult = (e: SpeechRecognitionEvent) => {
        const results = e.results;
        const last = results[results.length - 1];
        if (!last.isFinal) return;

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

      try {
        rec.start();
        recognitionRef.current = rec;
      } catch {
        console.info('[VoiceNav] Could not start recognition');
      }
    }

    // Already started or permanently denied — do nothing
    if (voiceNavStarted || permissionDenied) return;
    voiceNavStarted = true;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      console.info('[VoiceNav] Speech recognition not available in this browser');
      return;
    }

    // Check permission state before attempting to start
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then(result => {
          if (result.state === 'denied') {
            permissionDenied = true;
            console.info('[VoiceNav] Microphone permission denied — voice commands disabled');
            return;
          }
          startRecognition(SpeechRec);
          
          result.onchange = () => {
            if (result.state === 'denied') {
              permissionDenied = true;
              recognitionRef.current?.stop();
            }
          };
        })
        .catch(() => {
          // permissions API not supported — try starting anyway, handle error once
          startRecognition(SpeechRec);
        });
    } else {
      // Basic fallback if permissions API is missing
      startRecognition(SpeechRec);
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [navigate]);

  return null;
}
