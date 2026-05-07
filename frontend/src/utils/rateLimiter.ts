/**
 * rateLimiter.ts
 * Client-side rate limiting using sessionStorage.
 */
interface RateLimitState {
  timestamps: number[];
}

export const rateLimiter = {
  checkLimit(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; waitSeconds: number } {
    const now = Date.now();
    const raw = sessionStorage.getItem(`rsos_ratelimit_${key}`);
    const state: RateLimitState = raw ? JSON.parse(raw) : { timestamps: [] };

    // Remove timestamps outside the window
    state.timestamps = state.timestamps.filter(ts => now - ts < windowMs);

    if (state.timestamps.length >= maxAttempts) {
      const oldest = state.timestamps[0];
      const waitSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
      return { allowed: false, waitSeconds };
    }

    // Record attempt
    state.timestamps.push(now);
    sessionStorage.setItem(`rsos_ratelimit_${key}`, JSON.stringify(state));
    return { allowed: true, waitSeconds: 0 };
  }
};
