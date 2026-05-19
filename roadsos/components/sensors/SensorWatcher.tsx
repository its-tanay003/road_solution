'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSOSStore } from '@/lib/store/sosStore';

// Shake-to-SOS + Crash Detection via DeviceMotion API
export function SensorWatcher() {
  const { status, arm } = useSOSStore();
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
  const shakeTimestampRef = useRef(0);
  const crashCooldownRef = useRef(false);

  const handleMotion = useCallback(
    (e: DeviceMotionEvent) => {
      if (status !== 'idle') return;
      const acc = e.accelerationIncludingGravity;
      if (!acc?.x) return;

      const { x = 0, y = 0, z = 0 } = acc;
      const prev = lastAccelRef.current;
      const delta = Math.sqrt(
        Math.pow(x - prev.x, 2) + Math.pow(y - prev.y, 2) + Math.pow(z - prev.z, 2)
      );

      lastAccelRef.current = { x, y, z };

      const shakeThreshold = 25; // configurable
      const crashThreshold = 40; // ~4g sudden deceleration

      if (delta > crashThreshold && !crashCooldownRef.current) {
        // Crash detected
        crashCooldownRef.current = true;
        arm('crash');
        useSOSStore.setState({ status: 'countdown', countdownSeconds: 15 });
        setTimeout(() => { crashCooldownRef.current = false; }, 10000);
      } else if (delta > shakeThreshold) {
        const now = Date.now();
        if (now - shakeTimestampRef.current < 300) {
          // Rapid consecutive shakes
          arm('shake');
          useSOSStore.setState({ status: 'countdown' });
        }
        shakeTimestampRef.current = now;
      }
    },
    [status, arm]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [handleMotion]);

  return null;
}
