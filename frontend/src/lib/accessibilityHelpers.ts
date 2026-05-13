/**
 * ROADSoS — Accessibility Helpers
 * Screen reader announcements, focus management, haptic feedback
 */

// ── Screen Reader Announcer ─────────────────────────────────────
/** Announce a message to screen readers via the aria-live region */
export const announce = (msg: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const id = priority === 'assertive' ? 'announcer-assertive' : 'announcer-polite';
  const el = document.getElementById(id);
  if (!el) return;
  // Reset first so repeat messages re-trigger
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 2000);
  });
};

// ── Focus Management ────────────────────────────────────────────
/**
 * Move focus to the first h1 on the page after a route transition.
 * Falls back to #main-content if no h1 exists.
 */
export const focusPageHeading = (): void => {
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('main h1');
    const fallback = document.getElementById('main-content');
    const target = heading ?? fallback;
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: false });
  });
};

/**
 * Trap focus within a container element (for modals).
 * Returns a cleanup function to remove the listener.
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusable = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const els = Array.from(container.querySelectorAll<HTMLElement>(focusable));
    if (!els.length) return;
    const first = els[0];
    const last  = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
};

// ── Haptic Feedback ─────────────────────────────────────────────
/** Single short haptic — navigation tab switch */
export const hapticLight = (): void => {
  navigator.vibrate?.(10);
};

/** Medium haptic — confirmation, success */
export const hapticMedium = (): void => {
  navigator.vibrate?.(30);
};

/** Error / rejection pattern */
export const hapticError = (): void => {
  navigator.vibrate?.([50, 30, 50]);
};

/** SOS activation warning pattern */
export const hapticSOS = (): void => {
  navigator.vibrate?.([100, 50, 100, 50, 200]);
};

// ── Reduced Motion ──────────────────────────────────────────────
export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
