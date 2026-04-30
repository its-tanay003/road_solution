export interface Responder {
  id: string;
  name: string;
  type: 'ambulance' | 'police' | 'hospital' | 'volunteer' | 'professional';
  phone_primary: string;
  distance: number; // in meters
  eta: number; // in seconds
  tier: 'critical' | 'secondary' | 'backup';
  lat: number;
  lng: number;
  verificationLevel: 'BASIC' | 'TRAINED' | 'VERIFIED';
  reputation: number;
  matchScore?: number;
}
