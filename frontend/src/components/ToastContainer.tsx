import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toastVariants } from '../lib/pageTransition';

// ── Types ────────────────────────────────────────────────────────
export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id:      string;
  type:    ToastType;
  title:   string;
  message?: string;
  duration?: number; // ms, default 4000
}

// ── Context ───────────────────────────────────────────────────────
interface ToastCtx {
  show: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastCtx>({
  show:    () => {},
  dismiss: () => {},
});

export const useToast = () => useContext(ToastContext);

// ── Convenience helpers ───────────────────────────────────────────
const ICONS: Record<ToastType, string> = {
  success: '✅',
  error:   '🔴',
  warning: '⚠️',
  info:    'ℹ️',
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'rgba(0,230,118,0.40)',
  error:   'rgba(255,23,68,0.45)',
  warning: 'rgba(255,179,0,0.40)',
  info:    'rgba(41,121,255,0.35)',
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
        style={{
          position: 'fixed',
          top: 68,           // below TopBar
          right: 16,
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          maxWidth: 360,
          width: 'calc(100vw - 32px)',
        }}
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
      style={{
        pointerEvents: 'all',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        background: 'rgba(19, 27, 43, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${BORDER_COLORS[toast.type]}`,
        borderRadius: 16,
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        cursor: 'pointer',
      }}
      onClick={() => onDismiss(toast.id)}
    >
      {/* Icon */}
      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
        {ICONS[toast.type]}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{
            margin: '4px 0 0',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        aria-label="Dismiss notification"
        onClick={e => { e.stopPropagation(); onDismiss(toast.id); }}
        style={{
          background: 'none', border: 'none', color: 'var(--text-hint)',
          cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1,
          flexShrink: 0, marginTop: 1,
        }}
      >
        ×
      </button>
    </motion.div>
  );
}
