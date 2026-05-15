import { createContext, useContext } from 'react';

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
export interface ToastCtx {
  show: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastCtx>({
  show:    () => {},
  dismiss: () => {},
});

export const useToast = () => useContext(ToastContext);
