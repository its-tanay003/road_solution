'use client';

import { useEffect, useState } from 'react';
import { useSOSStore } from '@/lib/store/sosStore';

const CRASH_G_FORCE_THRESHOLD = 4.0; // 4g deceleration
const ROLLOVER_THRESHOLD_DEG = 120; // 120 degrees tilt

export function CrashDetection() {
  const { status, arm } = useSOSStore();
  const [sensorsActive, setSensorsActive] = useState(false);

  useEffect(() => {
    // Only listen if idle
    if (status !== 'idle') return;

    let lastAccel = { x: 0, y: 0, z: 0 };
    let lastTime = Date.now();

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;
      
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      
      if (dt > 0.05) {
        // Calculate magnitude of acceleration (in m/s^2)
        const magnitude = Math.sqrt(x*x + y*y + z*z);
        // Standard gravity is ~9.81 m/s^2. 1g = 9.81
        const gForce = magnitude / 9.81;

        // Auto-crash detection (>4g)
        if (gForce > CRASH_G_FORCE_THRESHOLD) {
          console.warn(`[CrashDetection] High G-Force detected: ${gForce.toFixed(2)}g`);
          arm('crash', 15); // 15 seconds cancel for auto-crash
        }
        
        // Shake detection (rapid change)
        const deltaX = Math.abs(x - lastAccel.x);
        const deltaY = Math.abs(y - lastAccel.y);
        const deltaZ = Math.abs(z - lastAccel.z);
        
        if (deltaX + deltaY + deltaZ > 25) { // Arbitrary shake threshold
          console.warn(`[CrashDetection] Shake detected`);
          arm('shake', 30);
        }

        lastAccel = { x, y, z };
        lastTime = now;
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event; // beta is front-to-back, gamma is left-to-right
      if (beta === null || gamma === null) return;
      
      // If phone is tilted more than 120 degrees in either direction, consider it a rollover
      if (Math.abs(beta) > ROLLOVER_THRESHOLD_DEG || Math.abs(gamma) > ROLLOVER_THRESHOLD_DEG) {
        console.warn(`[CrashDetection] Rollover detected: beta=${beta?.toFixed(0)}, gamma=${gamma?.toFixed(0)}`);
        arm('rollover', 15);
      }
    };

    const requestPermissions = async () => {
      // iOS requires explicit permission for DeviceMotionEvent
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permissionState = await (DeviceMotionEvent as any).requestPermission();
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            window.addEventListener('deviceorientation', handleOrientation);
            setSensorsActive(true);
          }
        } catch (e) {
          console.error("Permission request for device motion failed", e);
        }
      } else {
        // Non-iOS devices typically don't require explicit permission
        window.addEventListener('devicemotion', handleMotion);
        window.addEventListener('deviceorientation', handleOrientation);
        setSensorsActive(true);
      }
    };

    // Try to auto-start if permissions are already granted or not required
    requestPermissions();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [status, arm]);

  // We don't render anything visually by default, but could render an indicator
  return null;
}
