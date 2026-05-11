import { useState, useCallback } from 'react';
import { logger } from '../lib/logger';

export const useWakeWord = (
  wakeWords: string[], 
  onWakeWordDetected: (word: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    // @ts-ignore - SpeechRecognition is vendor-prefixed in many browsers
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      
      logger.log("Heard:", transcript);

      for (const word of wakeWords) {
        if (transcript.includes(word.toLowerCase())) {
          onWakeWordDetected(word);
          break;
        }
      }
    };

    recognition.onerror = (event: any) => {
      logger.error("Speech Recognition Error:", event.error);
      if (event.error !== 'no-speech') {
        setError(event.error);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      logger.error("Could not start recognition:", e);
    }

    return () => {
      recognition.stop();
      setIsListening(false);
    };
  }, [wakeWords, onWakeWordDetected, isListening]);

  return { isListening, error, startListening };
};
