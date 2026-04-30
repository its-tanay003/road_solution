import crypto from 'crypto';

export interface MedicalSummary {
  incidentId: string;
  timestamp: string;
  severity: string;
  injuries: string[];
  patientProfile: {
    bloodGroup?: string;
    allergies?: string;
    conditions?: string;
  };
  secureToken: string;
}

export const generateSecureHandoff = async (
  incidentId: string, 
  severity: string, 
  injuries: string[], 
  medicalProfile: any
): Promise<MedicalSummary> => {
  // Generate a secure, time-limited token
  const rawToken = crypto.randomBytes(32).toString('hex');
  
  // In a real system, we would hash this and store it in `secure_handoff_tokens`
  // with an expiration (e.g., 2 hours). First responders scan a QR code containing
  // the raw token to decrypt and view the medical profile.
  
  return {
    incidentId,
    timestamp: new Date().toISOString(),
    severity,
    injuries,
    patientProfile: medicalProfile || {
      bloodGroup: 'Unknown',
      allergies: 'Unknown',
      conditions: 'Unknown'
    },
    secureToken: rawToken
  };
};
