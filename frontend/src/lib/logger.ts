const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => isDev && console.log('[ROADSoS]', ...args),
  warn: (...args: unknown[]) => isDev && console.warn('[ROADSoS]', ...args),
  error: (...args: unknown[]) => console.error('[ROADSoS ERROR]', ...args),
};
