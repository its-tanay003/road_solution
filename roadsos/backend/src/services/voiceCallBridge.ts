import { EmergencyPayload } from './adapters/emergencyAdapter';

export class VoiceCallBridge {
  private static RETRY_LIMIT = 3;

  static async initiateCall(payload: EmergencyPayload) {
    const message = this.generateAIVoiceMessage(payload);
    console.log(`[VOICE-BRIDGE] Initiating call to emergency services...`);
    
    let attempt = 1;
    let success = false;

    while (attempt <= this.RETRY_LIMIT && !success) {
      try {
        console.log(`[VOICE-BRIDGE] Attempt ${attempt}: Dialing...`);
        // Simulate Twilio Voice API call
        // const call = await twilioClient.calls.create({ twiml: `<Response><Say>${message}</Say></Response>`, to: '911' });
        
        // Mocking successful connection after dial
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`[VOICE-BRIDGE] AI MESSAGE: "${message}"`);
        success = true;
      } catch (error) {
        console.error(`[VOICE-BRIDGE] Call failed on attempt ${attempt}:`, error);
        attempt++;
        if (attempt <= this.RETRY_LIMIT) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // wait before retry
        }
      }
    }

    return { success, messageSent: message };
  }

  private static generateAIVoiceMessage(payload: EmergencyPayload): string {
    const { location, type, medicalInfo } = payload;
    let message = `This is an automated emergency report from ROADSoS. `;
    message += `A ${type} incident has been detected at latitude ${location.lat.toFixed(4)}, longitude ${location.lng.toFixed(4)}. `;
    
    if (payload.severity === 'CRITICAL') {
      message += `The user is detected as potentially unconscious or in high distress. `;
    }

    if (medicalInfo) {
      message += `Patient has sensitive medical history including ${Object.keys(medicalInfo).join(', ')}. `;
    }

    message += `Please dispatch emergency services immediately. Contact number is ${payload.contactNumber || 'not provided'}.`;
    
    return message;
  }
}
