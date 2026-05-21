'use client';

import { useCrashDetection } from '@/hooks/useCrashDetection';
import { CrashAlertOverlay } from '../CrashAlertOverlay';

export function CrashDetection() {
  // Call the hook to setup motion/orientation event listeners
  useCrashDetection();

  return <CrashAlertOverlay />;
}
