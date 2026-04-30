import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'mock_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'mock_token';
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Initialize only if not mocked
const client = accountSid !== 'mock_sid' ? twilio(accountSid, authToken) : null;

export const sendSosSms = async (to: string, message: string): Promise<boolean> => {
  if (!client) {
    console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
    return true;
  }

  try {
    await client.messages.create({
      body: message,
      from: twilioNumber,
      to
    });
    return true;
  } catch (error) {
    console.error('Failed to send SMS via Twilio', error);
    return false;
  }
};
