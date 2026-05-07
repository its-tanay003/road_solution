/**
 * privacyConsent.ts
 * Manages user consent for DPDP Act 2023 compliance.
 */
import { secureStorage } from './secureStorage';

export interface ConsentState {
  emergencyLocation: boolean; // Required
  analytics: boolean;
  incidentHistory: boolean;
  version: string;
  timestamp: number;
}

const CONSENT_KEY = 'privacy_consent';
const CURRENT_VERSION = '1.0';

export const privacyConsent = {
  get(): ConsentState | null {
    return secureStorage.get<ConsentState>(CONSENT_KEY);
  },

  set(consents: Partial<ConsentState>): void {
    const existing = this.get() || {
      emergencyLocation: false,
      analytics: false,
      incidentHistory: false,
      version: CURRENT_VERSION,
      timestamp: Date.now()
    };
    
    secureStorage.set(CONSENT_KEY, {
      ...existing,
      ...consents,
      timestamp: Date.now()
    });
  },

  hasConsent(): boolean {
    const consent = this.get();
    return !!(consent && consent.emergencyLocation && consent.version === CURRENT_VERSION);
  }
};
