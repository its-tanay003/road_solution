'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSOSStore } from '@/lib/store/sosStore';
import { toast } from 'sonner';

export function SensorWatcher() {
  const { status, arm } = useSOSStore();
  const highAccelStartRef = useRef<number>(0);
  const lastHighAccelRef = useRef<number>(0);
  const isCountingDownRef = useRef<boolean>(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerShakeFlow = useCallback(() => {
    if (status !== 'idle' || isCountingDownRef.current) return;
    isCountingDownRef.current = true;

    let secondsLeft = 5;
    const toastId = toast.info(`Shake detected — SOS in 5s`, {
      action: {
        label: 'Cancel',
        onClick: () => {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          isCountingDownRef.current = false;
          toast.dismiss(toastId);
          toast.success('SOS cancelled');
        }
      },
      duration: Infinity
    });

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        isCountingDownRef.current = false;
        toast.dismiss(toastId);
        arm('shake');
      } else {
        toast.info(`Shake detected — SOS in ${secondsLeft}s`, {
          id: toastId,
          action: {
            label: 'Cancel',
            onClick: () => {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
              }
              isCountingDownRef.current = false;
              toast.dismiss(toastId);
              toast.success('SOS cancelled');
            }
          },
          duration: Infinity
        });
      }
    }, 1000);
  }, [status, arm]);

  const handleMotion = useCallback(
    (e: DeviceMotionEvent) => {
      if (status !== 'idle') return;

      const acc = e.acceleration || e.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;

      const magnitude = Math.sqrt(x * x + y * y + z * z);

      // Sudden stop / Crash: >40 m/s^2
      if (magnitude > 40) {
        console.warn(`[SensorWatcher] Sudden stop / Crash detected: ${magnitude.toFixed(2)} m/s²`);
        toast.error('Crash detected! Initiating emergency broadcast...', { duration: 5000 });
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        isCountingDownRef.current = false;
        arm('crash');
        return;
      }

      // Shake: >25 m/s^2 sustained for 500ms
      if (magnitude > 25) {
        const now = Date.now();
        if (highAccelStartRef.current === 0) {
          highAccelStartRef.current = now;
        }
        lastHighAccelRef.current = now;

        if (now - highAccelStartRef.current >= 500) {
          highAccelStartRef.current = 0; // reset
          triggerShakeFlow();
        }
      } else {
        if (Date.now() - lastHighAccelRef.current > 100) {
          highAccelStartRef.current = 0;
        }
      }
    },
    [status, arm, triggerShakeFlow]
  );

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (status !== 'idle') return;
    const { beta, gamma } = e;
    if (beta === null || gamma === null) return;

    // Rollover: phone tilted > 120 deg
    if (Math.abs(beta) > 120 || Math.abs(gamma) > 120) {
      console.warn(`[SensorWatcher] Rollover detected: beta=${beta.toFixed(0)}, gamma=${gamma.toFixed(0)}`);
      arm('rollover', 15);
    }
  }, [status, arm]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const requestPermissions = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permissionState = await (DeviceMotionEvent as any).requestPermission();
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (e) {
          console.error('[SensorWatcher] Permission request failed', e);
        }
      } else {
        window.addEventListener('devicemotion', handleMotion);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    requestPermissions();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [handleMotion, handleOrientation]);

  return null;
}

