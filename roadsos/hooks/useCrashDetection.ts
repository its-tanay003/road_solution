'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSOSStore } from '@/lib/store/sosStore';
import { useCrashStore, type CrashSensitivity } from '@/lib/store/crashStore';

let alarmStopFn: (() => void) | null = null;

const playAlertTone = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    
    // Siren warble frequency modulation
    let isHigh = true;
    const interval = setInterval(() => {
      if (audioCtx.state === 'closed') {
        clearInterval(interval);
        return;
      }
      const targetFreq = isHigh ? 440 : 880;
      osc.frequency.linearRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.4);
      isHigh = !isHigh;
    }, 500);

    gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();

    return () => {
      clearInterval(interval);
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
        audioCtx.close();
      } catch (err) {
        console.warn('Audio Context release error:', err);
      }
    };
  } catch (err) {
    console.warn('Web Audio Context initialization blocked or unsupported:', err);
    return () => {};
  }
};

export function useCrashDetection() {
  const armSOS = useSOSStore((s) => s.arm);
  
  const {
    isCrashMonitoring,
    sensitivity,
    crashTriggered,
    countdownSeconds,
    setCrashMonitoring,
    setSensitivity,
    setCrashTriggered,
    setCountdownSeconds,
    setTriggerReason,
    resetCrash,
  } = useCrashStore();

  const motionStart40Ref = useRef<number>(0);
  const motionStart25Ref = useRef<number>(0);
  const lastNormalTiltRef = useRef<number>(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set sensitivity thresholds
  const getThresholds = useCallback(() => {
    switch (sensitivity) {
      case 'high':
        return { crash: 30, impact: 18, tilt: 45 };
      case 'low':
        return { crash: 50, impact: 35, tilt: 75 };
      case 'normal':
      default:
        return { crash: 40, impact: 25, tilt: 60 };
    }
  }, [sensitivity]);

  const triggerCrashFlow = useCallback((reason: 'crash likely' | 'impact detected' | 'rollover possible') => {
    if (useCrashStore.getState().crashTriggered) return;
    
    setCrashTriggered(true);
    setTriggerReason(reason);
    setCountdownSeconds(15);
    
    // Play loud alert tone
    if (alarmStopFn) alarmStopFn();
    alarmStopFn = playAlertTone();

    // Start 15s countdown
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      const currentVal = useCrashStore.getState().countdownSeconds;
      if (currentVal <= 1) {
        // Trigger SOS !
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (alarmStopFn) {
          alarmStopFn();
          alarmStopFn = null;
        }
        
        // Execute SOS trigger
        armSOS('crash');
        useCrashStore.getState().resetCrash();
      } else {
        setCountdownSeconds(currentVal - 1);
      }
    }, 1000);
  }, [setCrashTriggered, setTriggerReason, setCountdownSeconds, armSOS]);

  const handleCancel = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (alarmStopFn) {
      alarmStopFn();
      alarmStopFn = null;
    }
    resetCrash();
  }, [resetCrash]);

  // Motion analysis
  const handleDeviceMotion = useCallback((e: DeviceMotionEvent) => {
    if (!isCrashMonitoring || useCrashStore.getState().crashTriggered) return;

    const acc = e.acceleration || e.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x ?? 0;
    const y = acc.y ?? 0;
    const z = acc.z ?? 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    const thresholds = getThresholds();

    // 1. Crash likely (>40 m/s^2 for 200ms)
    if (magnitude > thresholds.crash) {
      const now = Date.now();
      if (motionStart40Ref.current === 0) {
        motionStart40Ref.current = now;
      }
      if (now - motionStart40Ref.current >= 200) {
        motionStart40Ref.current = 0; // reset
        triggerCrashFlow('crash likely');
      }
    } else {
      motionStart40Ref.current = 0;
    }

    // 2. Impact detected (>25 m/s^2 for 500ms)
    if (magnitude > thresholds.impact) {
      const now = Date.now();
      if (motionStart25Ref.current === 0) {
        motionStart25Ref.current = now;
      }
      if (now - motionStart25Ref.current >= 500) {
        motionStart25Ref.current = 0; // reset
        triggerCrashFlow('impact detected');
      }
    } else {
      motionStart25Ref.current = 0;
    }
  }, [isCrashMonitoring, getThresholds, triggerCrashFlow]);

  // Orientation analysis
  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (!isCrashMonitoring || useCrashStore.getState().crashTriggered) return;

    const beta = e.beta;
    const gamma = e.gamma;
    if (beta === null || gamma === null) return;

    const absBeta = Math.abs(beta);
    const absGamma = Math.abs(gamma);

    const thresholds = getThresholds();
    const now = Date.now();

    // Check if flat/normal tilt
    if (absBeta < 15 && absGamma < 15) {
      lastNormalTiltRef.current = now;
    }

    // Rollover: tilt > threshold in < 1s
    if (absBeta > thresholds.tilt || absGamma > thresholds.tilt) {
      if (lastNormalTiltRef.current !== 0 && now - lastNormalTiltRef.current < 1000) {
        lastNormalTiltRef.current = 0;
        triggerCrashFlow('rollover possible');
      }
    }
  }, [isCrashMonitoring, getThresholds, triggerCrashFlow]);

  const startMonitoring = useCallback(async () => {
    setCrashMonitoring(true);
    
    // Request permission on iOS 13+
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const state = await (DeviceMotionEvent as any).requestPermission();
        if (state === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
      } catch (err) {
        console.warn('iOS motion sensor permission request rejected:', err);
      }
    } else if (typeof window !== 'undefined') {
      window.addEventListener('devicemotion', handleDeviceMotion);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  }, [setCrashMonitoring, handleDeviceMotion, handleDeviceOrientation]);

  const stopMonitoring = useCallback(() => {
    setCrashMonitoring(false);
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    }
    handleCancel();
  }, [setCrashMonitoring, handleDeviceMotion, handleDeviceOrientation, handleCancel]);

  useEffect(() => {
    if (isCrashMonitoring) {
      void startMonitoring();
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleDeviceMotion);
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [isCrashMonitoring, startMonitoring, handleDeviceMotion, handleDeviceOrientation]);

  return {
    isCrashMonitoring,
    startMonitoring,
    stopMonitoring,
    sensitivity,
    setSensitivity,
    handleCancel,
  };
}
