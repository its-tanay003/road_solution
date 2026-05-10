import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an emergency medical triage AI trained on Advanced Trauma Life Support (ATLS) protocols, WHO Emergency Care guidelines, and Indian 108 EMRI triage standards. Assess the severity of injuries from descriptions, images, or vital signs. Output JSON: { "severity": "IMMEDIATE"|"URGENT"|"DELAYED"|"MINIMAL", "confidence": number, "primaryConcerns": string[], "recommendedUnitType": "ALS"|"BLS"|"First Responder"|"Air Ambulance", "estimatedTimeToDeterioration": string, "immediateActions": string[] }. Always prioritize life-threatening conditions. Never give a false reassurance. If uncertain, escalate.`;

export async function runTriageAgent(input: any, onStream?: (text: string) => void) {
  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: JSON.stringify(input) }
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
    console.error('Failed to parse TriageAgent output:', fullResponse);
    return { error: 'Failed to parse JSON', raw: fullResponse };
  }
}
