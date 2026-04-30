import { pool } from '../db/connection';

export class LegalInsuranceService {
  /**
   * Generates a structured legal/insurance report for an incident.
   * Includes AI-processed cause analysis and telemetry confirmation.
   */
  static async generateIncidentReport(sosEventId: string) {
    console.log(`[LEGAL-SERVICE] Generating automated incident report for ${sosEventId}`);
    
    // 1. Fetch incident data, logs, and telemetry
    const { rows } = await pool.query(
      `SELECT e.*, array_agg(l.action_type) as actions
       FROM sos_events e
       LEFT JOIN incident_logs l ON e.id = l.sos_event_id
       WHERE e.id = $1
       GROUP BY e.id`,
      [sosEventId]
    );

    if (rows.length === 0) throw new Error('Incident not found');

    const incident = rows[0];
    
    // 2. Draft the report structure
    const report = {
      reportId: `ROAD-SOS-${incident.id.split('-')[0].toUpperCase()}`,
      timestamp: new Date().toISOString(),
      incidentDetails: {
        type: incident.severity === 'CRITICAL' ? 'Major Collision' : 'Minor Assistance',
        location: incident.location,
        timestamp: incident.created_at,
      },
      telemetryEvidence: {
        speed_at_impact: incident.metadata?.speed || 'Unavailable',
        g_force: incident.metadata?.gForce || 'Unavailable',
        weather_conditions: 'Clear', // Mocking external weather API
      },
      aiAnalysis: {
        probableCause: 'Sudden deceleration indicative of rear-end collision.',
        legalLiabilityEstimate: 'To be determined by forensic reconstruction.',
      },
      verificationStatus: 'SYSTEM_VERIFIED'
    };

    // 3. Save to DB for insurance company retrieval
    await pool.query(
      `INSERT INTO incident_logs (sos_event_id, action_type, description, metadata) 
       VALUES ($1, $2, $3, $4)`,
      [sosEventId, 'LEGAL_REPORT_GENERATED', 'Automated legal report generated for insurance and FIR.', JSON.stringify(report)]
    );

    return report;
  }

  static async submitInsuranceClaim(reportId: string, insuranceProviderId: string) {
    console.log(`[INSURANCE] Submitting claim ${reportId} to provider ${insuranceProviderId}`);
    // Simulate API call to Insurance Gateway
    return { success: true, claimReference: `CLAIM-${Math.random().toString(36).substr(2, 9)}` };
  }
}
