import { useCallback } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';

interface AudioWindow extends Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
}

export const useDeafFeedback = () => {
  const { deafMode, hapticEnabled, setSoundMonitorActive } = useAccessibilityStore();

  const triggerFeedback = useCallback((type: 'info' | 'warning' | 'critical' | 'sos' | 'message') => {
    // 1. Haptic Feedback (navigator.vibrate)
    if (hapticEnabled && 'vibrate' in navigator) {
      switch (type) {
        case 'message':
          navigator.vibrate(100);
          break;
        case 'info':
          navigator.vibrate([100, 50, 100]);
          break;
        case 'warning':
          navigator.vibrate([200, 100, 200]);
          break;
        case 'critical':
          navigator.vibrate([200, 100, 200, 100, 200]);
          break;
        case 'sos':
          navigator.vibrate(500);
          break;
      }
    }

    // 2. Visual Feedback (Screen Flash)
    if (deafMode) {
      const flashLayer = document.createElement('div');
      flashLayer.className = 'fixed inset-0 z-[99999] pointer-events-none transition-opacity duration-300';
      
      let color = 'rgba(59, 130, 246, 0.2)'; // Info (Blue)
      let duration = 500;

      if (type === 'warning') {
        color = 'rgba(245, 158, 11, 0.3)'; // Amber
      } else if (type === 'critical' || type === 'sos') {
        color = 'rgba(239, 68, 68, 0.4)'; // Red
        duration = 800;
      }

      flashLayer.style.backgroundColor = color;
      document.body.appendChild(flashLayer);

      setTimeout(() => {
        flashLayer.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(flashLayer)) {
            document.body.removeChild(flashLayer);
          }
        }, 300);
      }, duration);
    }
  }, [deafMode, hapticEnabled]);

  const startSoundMonitor = useCallback(() => {
    if (!deafMode) {
      setSoundMonitorActive(false);
      return;
    }

    const win = window as unknown as AudioWindow;
    const AudioContextClass = win.AudioContext || win.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setSoundMonitorActive(true);
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyzer);

        let lastTrigger = 0;
        const checkVolume = () => {
          if (!deafMode || audioContext.state === 'closed') {
            stream.getTracks().forEach(track => track.stop());
            if (audioContext.state !== 'closed') audioContext.close();
            setSoundMonitorActive(false);
            return;
          }

          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;

          // Threshold for loud sounds (sirens, horns)
          if (average > 75 && Date.now() - lastTrigger > 2000) {
            triggerFeedback('warning');
            lastTrigger = Date.now();
          }

          requestAnimationFrame(checkVolume);
        };

        checkVolume();
      })
      .catch(err => {
        console.error('Microphone access denied for Deaf Mode sound monitoring:', err);
        setSoundMonitorActive(false);
      });
  }, [deafMode, triggerFeedback, setSoundMonitorActive]);

  return { triggerFeedback, startSoundMonitor };
};
