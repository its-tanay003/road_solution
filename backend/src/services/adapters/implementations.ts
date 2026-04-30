import { EmergencyAdapter, EmergencyPayload } from './emergencyAdapter';

export class MockAdapter implements EmergencyAdapter {
  name = 'Mock Local Dispatcher';

  async sendSOS(payload: EmergencyPayload) {
    console.log(`[MOCK] Dispatching SOS for incident ${payload.incidentId} to local mock services.`);
    return { success: true, externalId: `MOCK-${Date.now()}` };
  }

  async notifyResponder(payload: EmergencyPayload, responderId: string) {
    console.log(`[MOCK] Notifying responder ${responderId} for incident ${payload.incidentId}.`);
    return { success: true };
  }
}

export class TwilioAdapter implements EmergencyAdapter {
  name = 'Twilio SMS/Voice Gateway';

  async sendSOS(payload: EmergencyPayload) {
    // Logic previously in twilioService.ts would go here
    console.log(`[TWILIO] Sending SMS to emergency services for incident ${payload.incidentId}`);
    // await twilioClient.messages.create(...)
    return { success: true, externalId: `TW-DISP-${payload.incidentId}` };
  }

  async notifyResponder(payload: EmergencyPayload, responderId: string) {
    console.log(`[TWILIO] Sending SMS to community responder ${responderId}`);
    return { success: true };
  }
}

export class GovAdapter implements EmergencyAdapter {
  name = 'Government FutureGov API';

  async sendSOS(payload: EmergencyPayload) {
    console.log(`[GOV] Submitting incident ${payload.incidentId} to state emergency portal.`);
    // POST to https://gov-emergency.api/v1/incident
    return { success: true, externalId: `GOV-REF-${Math.random().toString(36).substr(2, 9)}` };
  }

  async notifyResponder(payload: EmergencyPayload, responderId: string) {
    console.log(`[GOV] Syncing responder status for ${responderId} with civil defense database.`);
    return { success: true };
  }
}
