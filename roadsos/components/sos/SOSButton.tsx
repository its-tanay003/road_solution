'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSOSStore } from '@/lib/store/sosStore';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const HOLD_DURATION = 3000; // 3 seconds
const TRIPLE_PRESS_WINDOW = 1500; // ms

export function SOSButton() {
  const { status, arm } = useSOSStore();
  const { t } = useTranslation();
  const [pressing, setPressing] = useState(false);
  const [pressPercent, setPressPercent] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pressStartRef = useRef(0);
  const clickTimesRef = useRef<number[]>([]);

  const startPress = useCallback(() => {
    if (status !== 'idle') return;
    setPressing(true);
    pressStartRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - pressStartRef.current;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setPressPercent(pct);
      if (pct < 100) animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    holdTimerRef.current = setTimeout(() => {
      arm('manual');
      setPressing(false);
      setPressPercent(0);
    }, HOLD_DURATION);
  }, [status, arm]);

  const cancelPress = useCallback(() => {
    setPressing(false);
    setPressPercent(0);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleClick = useCallback(() => {
    if (status !== 'idle') return;
    const now = Date.now();
    clickTimesRef.current = [...clickTimesRef.current.filter((t) => now - t < TRIPLE_PRESS_WINDOW), now];
    if (clickTimesRef.current.length >= 3) {
      clickTimesRef.current = [];
      arm('triple-press');
    }
  }, [status, arm]);

  useEffect(() => () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const idle = status === 'idle';
  const size = 140;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pressPercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-[140px] h-[140px]">
      {/* Pulse rings when active */}
      {!idle && (
        <>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-red-500"
              animate={{ scale: [1, 1 + i * 0.3], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </>
      )}

      {/* Progress ring */}
      {pressing && (
        <svg className="absolute inset-0" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(239,68,68,0.2)"
            strokeWidth={6}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-none"
          />
        </svg>
      )}

      {/* Button */}
      <motion.button
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onClick={handleClick}
        whileTap={{ scale: 0.94 }}
        className={cn(
          'relative w-28 h-28 rounded-full flex flex-col items-center justify-center select-none touch-none',
          idle ? 'sos-button-idle' : 'sos-button-active',
        )}
        aria-label={t('sos.holdToActivate', 'SOS emergency button — hold 3 seconds or triple-press')}
        aria-pressed={!idle}
      >
        <span className="text-white font-black text-3xl tracking-wider leading-none">SOS</span>
        <span className="text-red-200 text-[10px] mt-1 font-medium">
          {pressing ? `${Math.round(pressPercent)}%` : idle ? t('sos.hold3s', 'Hold 3s') : '●'}
        </span>
      </motion.button>
    </div>
  );
}
