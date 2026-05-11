import { useCallback } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { ttsQueue } from '../utils/ttsQueue';

export const useAccessibilityAnnouncer = () => {
  const { ttsEnabled, deafMode, language, setLastAnnouncement } = useAccessibilityStore();

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // 1. ARIA Live Announcement (for screen readers)
    const ariaRegion = document.getElementById('aria-live-region');
    const assertiveRegion = document.getElementById('aria-live-region-assertive');
    
    const target = priority === 'assertive' ? assertiveRegion : ariaRegion;
    
    if (target) {
      target.textContent = '';
      setTimeout(() => {
        target.textContent = message;
      }, 50);
    }

    // Save for "Repeat" command
    setLastAnnouncement(message);

    // 2. TTS Announcement (if enabled and not in deaf mode)
    if (ttsEnabled && !deafMode) {
      const langCode = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-US';
      ttsQueue.speak(message, langCode);
    }

    // 3. Visual announcement for Deaf Mode (handled by components subscribing to state)
    // Here we could also trigger a custom event or update a store if we want a global visual overlay
  }, [ttsEnabled, deafMode, language, setLastAnnouncement]);

  const stopAnnouncing = useCallback(() => {
    ttsQueue.stop();
  }, []);

  return { announce, stopAnnouncing };
};
