import { useEffect, useRef, useCallback } from 'react';
import { useAIAssistantStore } from '../store/aiAssistantStore';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useAssistantOrchestrator } from './useAssistantOrchestrator';

// SpeechRecognition types provided by src/types/speech.d.ts

const langMap: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
};

export const useVoiceAssistant = () => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { 
    isListening, 
    setIsListening, 
    setInterimTranscript, 
    setInputMode 
  } = useAIAssistantStore();
  const { language } = useAccessibilityStore();
  const { sendToAI } = useAssistantOrchestrator();

  const startRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Speech recognition already started or failed', e);
      }
    }
  }, [setIsListening]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [setIsListening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition API not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interimTranscript);

      // Wake word detection: "Hey ROADSoS"
      if (finalTranscript.toLowerCase().includes('hey road sos') || finalTranscript.toLowerCase().includes('hey roadsos')) {
        console.log('Wake word detected!');
      }

      if (finalTranscript) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        silenceTimerRef.current = setTimeout(() => {
          const content = finalTranscript.trim();
          setInterimTranscript('');
          
          sendToAI(content);
          
          const cmd = content.toLowerCase();
          if (cmd.includes('stop') || cmd.includes('रुको') || cmd.includes('நிறுத்து')) {
            window.speechSynthesis.cancel();
          } else if (cmd.includes('camera on') || cmd.includes('कैमरा चालू करो')) {
            setInputMode('camera');
          }
        }, 1500);
      }
    };

    recognition.onerror = (event: { error: string }) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [language, isListening, setIsListening, setInterimTranscript, setInputMode, sendToAI]);

  return { startRecognition, stopRecognition };
};
