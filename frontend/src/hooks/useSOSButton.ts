import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSosStore } from '../store';
import { socket } from '../lib/socket';

export const useSOSButton = () => {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { sosActive, triggerSOS, cancelSOS, crashDetectedAt } = useSosStore();
  const navigate = useNavigate();
  const requestRef = useRef<number | null>(null);

  const animateRef = useRef<() => void>(null);

  const handleTrigger = useCallback(() => {
    // Generate incident ID if not provided
    const incidentId = `INC-${Math.random().toString(36).substring(7).toUpperCase()}`;
    triggerSOS(incidentId);
    
    // Mock location for demo (In production, use navigator.geolocation)
    const lat = 28.6139;
    const lng = 77.2090;
    const userId = 'demo_user_001';
    
    socket.emit('sos:triggered', {
      lat,
      lng,
      timestamp: Date.now(),
      userId,
      gForce: 12.4,
      incidentId
    });

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    setHoldProgress(0);
    setIsHolding(false);
    navigate('/sos-active');
  }, [navigate, triggerSOS]);

  const animate = useCallback(() => {
    setHoldProgress((prev) => {
      const next = prev + 2.5; // ~2.5s duration at 60fps
      if (next >= 100) {
        handleTrigger();
        return 100;
      }
      requestRef.current = requestAnimationFrame(animateRef.current!);
      return next;
    });
  }, [handleTrigger]);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  const holdStart = useCallback(() => {
    if (sosActive) return;
    setIsHolding(true);
    setHoldProgress(0);
    requestRef.current = requestAnimationFrame(animate);
    
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [animate, sosActive]);

  const holdEnd = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    setIsHolding(false);
    setHoldProgress((prev) => {
      // If we already triggered (past 100), don't reset
      if (prev >= 100) return 100;
      return 0;
    });
  }, []);

  const handleCancel = useCallback(() => {
    cancelSOS();
    socket.emit('sos:cancelled');
    navigate('/');
  }, [cancelSOS, navigate]);

  // Sync countdown for internal state visibility
  useEffect(() => {
    if (sosActive && crashDetectedAt) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - crashDetectedAt) / 1000);
        const remaining = Math.max(0, 10 - elapsed);
        setCountdown(remaining);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Defer to avoid synchronous state update in effect
      const timer = setTimeout(() => setCountdown(10), 0);
      return () => clearTimeout(timer);
    }
  }, [sosActive, crashDetectedAt]);

  return {
    holdProgress,
    isHolding,
    sosActive,
    countdown,
    holdStart,
    holdEnd,
    cancelSOS: handleCancel,
  };
};
