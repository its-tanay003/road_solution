import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useSosStore } from '../store/sosStore';
import { useAIAssistantStore } from '../store/aiAssistantStore';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface WindowWithSpeechRecognition {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}

const FONT_SIZES: ('sm' | 'md' | 'lg' | 'xl' | 'xxl')[] = ['sm', 'md', 'lg', 'xl', 'xxl'];

export const useVoiceNavigation = () => {
  const navigate = useNavigate();
  const { 
    voiceNavEnabled, 
    setTheme, 
    setLanguage, 
    setFontSize, 
    fontSize,
    setSimplifiedMode,
    lastAnnouncement 
  } = useAccessibilityStore();
   const { triggerSOS, cancelSOS } = useSosStore();
  const { setIsListening, setIsSpeaking } = useAIAssistantStore();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase().trim();
    console.log('Voice Command Received:', cmd);

    // NAVIGATION
    if (cmd.includes('go home')) navigate('/');
    else if (cmd.includes('open map')) navigate('/map');
    else if (cmd.includes('open settings')) navigate('/settings');
    else if (cmd.includes('open profile')) navigate('/profile');
    else if (cmd.includes('open assistant')) navigate('/assistant');
    else if (cmd.includes('go back')) navigate(-1);

    // SOS COMMANDS
    else if (cmd.includes('send sos') || cmd.includes('emergency help') || cmd.includes('call ambulance')) {
      triggerSOS();
    }
    else if (cmd.includes('cancel sos') || cmd.includes('i am safe')) {
      cancelSOS();
    }
    else if (cmd.includes('call 108')) window.location.href = 'tel:108';
    else if (cmd.includes('call 112')) window.location.href = 'tel:112';

    // SETTINGS COMMANDS
    else if (cmd.includes('increase text size')) {
      const currentIndex = FONT_SIZES.indexOf(fontSize as 'sm' | 'md' | 'lg' | 'xl' | 'xxl');
      if (currentIndex < FONT_SIZES.length - 1) setFontSize(FONT_SIZES[currentIndex + 1]);
    }
    else if (cmd.includes('decrease text size')) {
      const currentIndex = FONT_SIZES.indexOf(fontSize as 'sm' | 'md' | 'lg' | 'xl' | 'xxl');
      if (currentIndex > 0) setFontSize(FONT_SIZES[currentIndex - 1]);
    }
    else if (cmd.includes('switch to hindi')) setLanguage('hi');
    else if (cmd.includes('switch to tamil')) setLanguage('ta');
    else if (cmd.includes('dark mode')) setTheme('dark');
    else if (cmd.includes('light mode')) setTheme('light');
    else if (cmd.includes('high contrast')) setTheme('high-contrast');
    else if (cmd.includes('simplified mode')) setSimplifiedMode(true);

    // ASSISTANT & ACCESSIBILITY COMMANDS
    else if (cmd.includes('repeat') || cmd.includes('say that again')) {
      if (lastAnnouncement) {
        const utterance = new SpeechSynthesisUtterance(lastAnnouncement);
        window.speechSynthesis.speak(utterance);
      }
    }
    else if (cmd.includes('start listening') || cmd.includes('talk to me')) {
      setIsListening(true);
    }
    else if (cmd.includes('stop listening') || cmd.includes('be quiet')) {
      setIsListening(false);
      setIsSpeaking(false);
    }

  }, [navigate, fontSize, setFontSize, setLanguage, setTheme, setSimplifiedMode, triggerSOS, cancelSOS, lastAnnouncement, setIsListening, setIsSpeaking]);

  useEffect(() => {
    if (!voiceNavEnabled) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }

    const win = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript;
      handleCommand(command);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech Recognition Error:', event.error);
      if (event.error === 'no-speech') return;
      // Restart on certain errors
      setTimeout(() => {
        if (voiceNavEnabled) recognition.start();
      }, 1000);
    };

    recognition.onend = () => {
      if (voiceNavEnabled) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [voiceNavEnabled, handleCommand]);
};
