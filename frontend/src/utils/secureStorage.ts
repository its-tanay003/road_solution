/**
 * secureStorage.ts
 * Obfuscated storage wrapper for production security.
 */
export const secureStorage = {
  set(key: string, value: unknown): void {
    try {
      const json = JSON.stringify(value);
      const encoded = btoa(encodeURIComponent(json));
      localStorage.setItem(`rsos_${key}`, encoded);
    } catch (e) {
      console.error('SecureStorage Error:', e);
    }
  },

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(`rsos_${key}`);
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(atob(raw))) as T;
    } catch {
      localStorage.removeItem(`rsos_${key}`);
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(`rsos_${key}`);
  },

  clearAll(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith('rsos_'))
      .forEach(k => localStorage.removeItem(k));
  }
};
