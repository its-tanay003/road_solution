import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a medical AI trained on clinical visual diagnosis. Analyze images and video frames of injured persons and identify: visible injuries (lacerations, fractures, burns, bruising), level of consciousness (responsive/unresponsive/confused), skin color (pallor, cyanosis, flushing), breathing pattern (normal/labored/absent), pupil response if visible, approximate age range, body position, and any environmental hazards. Output JSON: { "observedConditions": string[], "consciousnessLevel": string, "urgencyIndicators": string[], "estimatedSeverity": "CRITICAL"|"SERIOUS"|"MODERATE"|"MINOR", "visualConfidence": number, "additionalObservations": string }. Be specific. Do not speculate beyond what is visible.`;

export async function runVisionAgent(imageBase64: string | undefined, videoFrames: string[] = [], onStream?: (text: string) => void) {
  if (!imageBase64 && videoFrames.length === 0) return null;

  const content: any[] = [];
  
  if (imageBase64) {
    const [mediaType, base64Data] = imageBase64.split(',');
    const mediaTypeValue = mediaType.split(':')[1].split(';')[0];
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: mediaTypeValue as any, data: base64Data }
    });
  }

  for (const frame of videoFrames) {
    if (frame) {
      const [mediaType, base64Data] = frame.split(',');
      const mediaTypeValue = mediaType.split(':')[1].split(';')[0];
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaTypeValue as any, data: base64Data }
      });
    }
  }

  content.push({ type: 'text', text: 'Analyze the provided visual data according to your instructions.' });

  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content }
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
    console.error('Failed to parse VisionAgent output:', fullResponse);
    return { error: 'Failed to parse JSON', raw: fullResponse };
  }
}
