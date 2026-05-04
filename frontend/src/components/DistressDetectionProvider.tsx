import React, { useEffect, useRef } from 'react';
import { useDistressStore } from '../store/distressStore';

export const DistressDetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isActive, addEvent, recalculate } = useDistressStore();
  
  const lastTapRef = useRef<number>(0);
  const scrollYRef = useRef<number>(window.scrollY);
  const lastActionRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start interval to constantly recalculate the rolling window
    const interval = setInterval(() => {
      recalculate();
    }, 1000);

    return () => clearInterval(interval);
  }, [recalculate]);

  useEffect(() => {
    if (!isActive) return;

    const handleInteraction = () => {
      lastActionRef.current = Date.now();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      // If no interaction for 15s after doing something, flag inactivity.
      inactivityTimerRef.current = setTimeout(() => {
        addEvent('INACTIVITY', 25);
      }, 15000);
    };

    const handleTouchStart = () => {
      handleInteraction();
      const now = Date.now();
      if (now - lastTapRef.current < 500) {
        // Rapid tap
        addEvent('RAPID_TAP', 15);
      }
      lastTapRef.current = now;
    };

    const handleScroll = () => {
      handleInteraction();
      const currentScroll = window.scrollY;
      const delta = Math.abs(currentScroll - scrollYRef.current);
      if (delta > 200) {
        // Erratic/large scroll jumping
        addEvent('ERRATIC_SCROLL', 10);
      }
      scrollYRef.current = currentScroll;
    };

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (!e.accelerationIncludingGravity) return;
      
      const { x, y, z } = e.accelerationIncludingGravity;
      if (x !== null && y !== null && z !== null) {
        // Calculate rough magnitude
        const magnitude = Math.sqrt(x*x + y*y + z*z);
        // Earth gravity is ~9.8. Anything wildly above or fluctuating might be shaking/running
        if (magnitude > 15) {
          addEvent('SHAKE', 20);
        }
      }
    };

    const setupBattery = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery: any = await (navigator as any).getBattery();
          
          battery.addEventListener('chargingchange', () => {
            if (battery.charging && battery.level <= 0.15) {
              // Phone plugged in at low battery - someone might be helping
              addEvent('HELP_ARRIVED', -50); 
            }
          });
        }
      } catch (err) {
        console.warn('Battery API not supported or permission denied', err);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });
    
    // Note: iOS requires explicit permission grant for device motion, but for this demo 
    // we attach it passively. If permission is needed, it should be requested via a button.
    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });

    setupBattery();

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('devicemotion', handleDeviceMotion);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isActive, addEvent]);

  return <>{children}</>;
};
