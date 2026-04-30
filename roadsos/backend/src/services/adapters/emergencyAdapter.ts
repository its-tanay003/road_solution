export interface EmergencyPayload {
  incidentId: string;
  type: string;
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
  location: { lat: number; lng: number; address?: string };
  telemetry: any;
  medicalInfo?: any;
  contactNumber?: string;
}

export interface EmergencyAdapter {
  name: string;
  sendSOS(payload: EmergencyPayload): Promise<{ success: boolean; externalId?: string; error?: string }>;
  notifyResponder(payload: EmergencyPayload, responderId: string): Promise<{ success: boolean }>;
}
