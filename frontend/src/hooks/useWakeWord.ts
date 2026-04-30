import { useState, useCallback } from 'react';

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useWakeWord = (
  wakeWords: string[], 
  onWakeWordDetected: (word: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    // Set to English, but could be dynamic based on user store
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      // Get the latest result
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      
      console.log("Heard:", transcript);

      // Check if any wake word is in the transcript
      for (const word of wakeWords) {
        if (transcript.includes(word.toLowerCase())) {
          onWakeWordDetected(word);
          break; // Stop checking if we found one
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error !== 'no-speech') {
        setError(event.error);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Automatically restart if it ends (e.g. network hiccup or silence timeout)
      // but only if we haven't unmounted or intentionally stopped.
      // For a robust system, we restart it.
      if (isListening) {
        try {
          recognition.start();
        } catch(e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Could not start recognition:", e);
    }

    return () => {
      recognition.stop();
      setIsListening(false);
    };
  }, [wakeWords, onWakeWordDetected, isListening]);

  return { isListening, error, startListening };
};
