import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toastVariants } from '../lib/pageTransition';
import './ToastContainer.css';

import { type Toast, type ToastType, ToastContext } from '../hooks/useToast';

// ── Convenience helpers ───────────────────────────────────────────
const ICONS: Record<ToastType, string> = {
  success: '✅',
  error:   '🔴',
  warning: '⚠️',
  info:    'ℹ️',
};

// ── Provider ──────────────────────────────────────────────────────
export function ToastContainer({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = toast.duration ?? 4000;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]); // max 5 toasts
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}

      {/* Portal-style fixed container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="toast-portal"
      >
        <AnimatePresence initial={false}>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ── Single Toast ──────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <motion.div
      role="status"
      aria-label={`${toast.type}: ${toast.title}${toast.message ? `. ${toast.message}` : ''}`}
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className={`toast-item ${toast.type}`}
      onClick={() => onDismiss(toast.id)}
    >
      {/* Icon */}
      <span className="toast-icon">
        {ICONS[toast.type]}
      </span>

      {/* Text */}
      <div className="toast-content">
        <p className="toast-title">
          {toast.title}
        </p>
        {toast.message && (
          <p className="toast-message">
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        aria-label="Dismiss notification"
        onClick={e => { e.stopPropagation(); onDismiss(toast.id); }}
        className="toast-close"
      >
        ×
      </button>
    </motion.div>
  );
}
