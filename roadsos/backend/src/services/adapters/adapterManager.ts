import { EmergencyAdapter, EmergencyPayload } from './emergencyAdapter';
import { MockAdapter, TwilioAdapter, GovAdapter } from './implementations';

class AdapterManager {
  private adapters: EmergencyAdapter[] = [];

  constructor() {
    this.adapters.push(new MockAdapter());
    // In production, these would be enabled via env vars
    if (process.env.ENABLE_TWILIO === 'true') this.adapters.push(new TwilioAdapter());
    if (process.env.ENABLE_GOV_SYNC === 'true') this.adapters.push(new GovAdapter());
  }

  async broadcastSOS(payload: EmergencyPayload) {
    const results = await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          return { adapter: adapter.name, result: await adapter.sendSOS(payload) };
        } catch (error) {
          return { adapter: adapter.name, result: { success: false, error: (error as Error).message } };
        }
      })
    );
    return results;
  }
}

export const adapterManager = new AdapterManager();
