import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a medical AI specializing in vital sign interpretation. Given heart rate, SpO2, blood pressure, respiratory rate, temperature, and HRV data from wearable devices, identify: shock indicators, hypoxia, cardiac arrhythmia, hypertension crisis, hypoglycemia signs. Cross-reference with patient medical profile if provided. Output JSON: { "vitalStatus": "NORMAL"|"CONCERNING"|"CRITICAL", "abnormalVitals": string[], "possibleConditions": string[], "urgencyLevel": number, "recommendations": string[] }. Flag any single vital that independently requires emergency response. (urgencyLevel should be 1-10)`;

export async function runVitalsAgent(vitalsData: any, userProfile?: any, onStream?: (text: string) => void) {
  if (!vitalsData) return null;

  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: JSON.stringify({ vitalsData, userProfile }) }
    ],
    stream: true,
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      const text = chunk.delta.text;
      fullResponse += text;
      if (onStream) onStream(text);
    }
  }

  try {
    return JSON.parse(fullResponse);
  } catch (e) {
    console.error('Failed to parse VitalsAgent output:', fullResponse);
    return { error: 'Failed to parse JSON', raw: fullResponse };
  }
}
