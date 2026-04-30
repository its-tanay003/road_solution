import { Responder } from '../models/types'; // assuming types exist

interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  specialties: string[];
  capacity: number; // 0 to 1
  distance?: number;
}

export class PrioritizationEngine {
  static async selectOptimalResponders(incident: any, candidates: Responder[]) {
    return candidates
      .map(responder => {
        let score = 0;
        
        // 1. Distance (closer is better)
        const dist = this.calculateDistance(incident.lat, incident.lng, responder.lat, responder.lng);
        score += Math.max(100 - (dist * 10), 0);

        // 2. Skill level (trained/verified bonus)
        if (responder.verificationLevel === 'VERIFIED') score += 50;
        if (responder.verificationLevel === 'TRAINED') score += 25;

        // 3. Reputation
        score += (responder.reputation || 0) / 10;

        return { ...responder, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3); // Top 3
  }

  static async selectOptimalHospital(incident: any, hospitals: Hospital[]) {
    return hospitals
      .map(hospital => {
        let score = 0;
        
        // 1. Specialty match
        if (incident.type === 'MEDICAL' && hospital.specialties.includes('TRAUMA')) {
          score += 100;
        }

        // 2. Capacity (less occupied is better)
        score += (1 - hospital.capacity) * 50;

        // 3. Distance
        const dist = this.calculateDistance(incident.lat, incident.lng, hospital.lat, hospital.lng);
        score += Math.max(100 - (dist * 5), 0);

        return { ...hospital, priorityScore: score };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)[0];
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Simplified Haversine or linear approximation
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
