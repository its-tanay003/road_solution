import { redisClient } from './cacheService';

interface RawIncidentReport {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  type: string;
  timestamp: number;
  confidence: number;
}

export class SwarmIntelligenceEngine {
  private static RADIUS_KM = 0.5; // Group reports within 500m
  private static TIME_WINDOW_MS = 300000; // Group reports within 5 minutes

  static async processReport(report: RawIncidentReport) {
    console.log(`[SWARM] Processing new report from user ${report.userId}`);
    
    // 1. Fetch nearby active incidents from Redis/PostGIS
    const nearbyIncidents = await this.findNearbyIncidents(report.lat, report.lng);

    if (nearbyIncidents.length > 0) {
      // 2. Aggregate into existing incident
      const targetIncidentId = nearbyIncidents[0]; // Simplistic: pick first
      await this.aggregateToIncident(targetIncidentId, report);
      return { action: 'AGGREGATED', incidentId: targetIncidentId };
    } else {
      // 3. Create new unified incident
      const newUnifiedId = `UNIFIED-${Math.random().toString(36).substr(2, 9)}`;
      await this.createUnifiedIncident(newUnifiedId, report);
      return { action: 'CREATED_NEW', incidentId: newUnifiedId };
    }
  }

  private static async findNearbyIncidents(lat: number, lng: number): Promise<string[]> {
    // Mocking spatial query
    return [];
  }

  private static async aggregateToIncident(unifiedId: string, report: RawIncidentReport) {
    console.log(`[SWARM] Aggregating report ${report.id} into unified incident ${unifiedId}`);
    // Update incident classification based on swarm data
    // e.g., if multiple users report "fire", increase fire probability
  }

  private static async createUnifiedIncident(unifiedId: string, report: RawIncidentReport) {
    console.log(`[SWARM] Initializing new unified incident ${unifiedId} from report ${report.id}`);
    // Store in DB/Cache
  }

  static calculateConfidence(reports: RawIncidentReport[]): number {
    if (reports.length === 0) return 0;
    const baseConfidence = reports.reduce((acc, r) => acc + r.confidence, 0) / reports.length;
    const swarmBonus = Math.min(reports.length * 0.1, 0.4); // Max 40% bonus for multiple reports
    return Math.min(baseConfidence + swarmBonus, 1.0);
  }
}
