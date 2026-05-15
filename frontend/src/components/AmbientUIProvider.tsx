import React, { useEffect, useState } from 'react';
import { useUIStore, useSosStore } from '../store';
import { logger } from '../lib/logger';

export const AmbientUIProvider = ({ children }: { children: React.ReactNode }) => {
  const { isStressed, setStressed } = useUIStore();
  const { uiSimplified } = useSosStore();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // iOS 13+ requires explicit permission for DeviceMotionEvent
  const requestMotionPermission = async () => {
    const DeviceMotionEventWithPermission = DeviceMotionEvent as unknown as DeviceMotionEventStatic;
    
    if (typeof DeviceMotionEventWithPermission.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEventWithPermission.requestPermission();
        setPermissionGranted(permission === 'granted');

      } catch (error) {
        logger.error('Error requesting motion permission:', error);
        setPermissionGranted(false);
      }
    } else {
      // Non-iOS 13+ devices don't need explicit permission
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    // We only attach the listener if permission is granted
    if (permissionGranted !== true) return;

    let lastUpdate = 0;
    const SHAKE_THRESHOLD = 25; // m/s^2 - indicates violent shaking/crash

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = Date.now();
      if (current - lastUpdate < 100) return; // throttle to 10Hz

      if (event.accelerationIncludingGravity) {
        const { x, y, z } = event.accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;

        // Calculate combined vector magnitude
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        
        // Subtract gravity (~9.8 m/s^2) approximately
        const delta = Math.abs(acceleration - 9.8);

        if (delta > SHAKE_THRESHOLD && !isStressed) {
          logger.warn('CRASH DETECTED: Triggering Ambient UI Brutalist Mode');
          setStressed(true);
        }
      }
      lastUpdate = current;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [permissionGranted, isStressed, setStressed]);

  // Apply CSS class to body when stressed
  useEffect(() => {
    if (isStressed || uiSimplified) {
      document.body.classList.add('brutalist');
      if (uiSimplified && !isStressed) {
        setStressed(true);
      }
    } else {
      document.body.classList.remove('brutalist');
    }
  }, [isStressed, uiSimplified, setStressed]);

  return (
    <>
      {permissionGranted === null && typeof (DeviceMotionEvent as unknown as DeviceMotionEventStatic).requestPermission === 'function' && (
        <div className="fixed inset-0 z-100 bg-void/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-raised border border-border-active p-6 rounded-2xl max-w-sm">
            <h2 className="text-xl font-bold font-display mb-4 text-primary">Enable Sensor Triage</h2>
            <p className="text-sm text-secondary mb-6">
              ROADSoS uses your device's motion sensors to automatically detect severe crashes and adapt the UI under stress.
            </p>
            <button 
              onClick={requestMotionPermission}
              className="w-full bg-(--color-safe) text-void font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Grant Sensor Access
            </button>
            <button 
              onClick={() => setPermissionGranted(false)}
              className="w-full mt-3 bg-transparent text-secondary text-sm py-2 hover:text-primary transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
};
