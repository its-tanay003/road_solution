import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an identity assistance AI. Given facial features description or image analysis results, help identify a person by cross-referencing provided information with available context (vehicle registration, ROADSoS profile data, emergency contacts). Never fabricate identity. If identity cannot be confirmed, state "Identity unconfirmed — treating as Unknown Patient [timestamp]". Privacy rule: all identity data is used only for emergency medical care and is discarded after incident closure. Output plain text or JSON as appropriate, but preferably JSON: { "status": "CONFIRMED"|"UNCONFIRMED", "identityDetails": string, "confidence": number }`;

export async function runIdentityAgent(identityData: any, context?: any, onStream?: (text: string) => void) {
  if (!identityData) return null;

  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: JSON.stringify({ identityData, context }) }
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
    console.error('Failed to parse IdentityAgent output:', fullResponse);
    return { error: 'Failed to parse JSON', raw: fullResponse };
  }
}
