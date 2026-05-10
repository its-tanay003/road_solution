import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an emergency first aid instructor trained in American Red Cross, St John Ambulance, and Indian EMRI first aid protocols. Provide step-by-step first aid instructions in simple language (Class 5 reading level). Speak directly to the helper, not the victim. Number each step. Each step must be one action only. After each step say "Tell me when done" to pace the helper. Output in the user's language. For cardiac arrest: guide CPR at 100-120 compressions/minute. For bleeding: direct pressure. For spinal injury: immobilize. Always repeat the most critical step if asked.`;

export async function runFirstAidAgent(orchestratorOutput: any, language: string = 'en', onStream?: (text: string) => void) {
  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: `Language: ${language}\n\nSituation: ${JSON.stringify(orchestratorOutput)}` }
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

  return fullResponse;
}
