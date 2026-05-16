import emergencyData from '../data/emergency-numbers.json';

export interface EmergencyData {
  [key: string]: {
    police: string;
    ambulance: string;
    fire: string;
  };
}

export const emergencyNumbers = emergencyData as EmergencyData;
