const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => isDev && console.log('[ROADSoS]', ...args),
  warn: (...args: any[]) => isDev && console.warn('[ROADSoS]', ...args),
  error: (...args: any[]) => console.error('[ROADSoS ERROR]', ...args),
};
