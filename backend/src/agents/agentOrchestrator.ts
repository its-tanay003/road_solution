import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the ROADSoS emergency response coordinator AI. You receive inputs from multiple specialized agents (triage, vision, vitals, first aid, identity) and synthesize them into a unified emergency response plan. Prioritize: 1) Life-threatening conditions first, 2) Dispatch the right resource, 3) Guide the bystander. Make decisions in under 3 seconds. Output a unified action plan as JSON: { "primaryAction": string, "dispatchRecommendation": string, "bystanderInstruction": string, "allAgentOutputs": object, "overallSeverity": string, "confidenceScore": number }. bystanderInstruction should be one sentence, maximum urgency.`;

export async function runOrchestratorAgent(allResults: any, onStream?: (text: string) => void) {
  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: JSON.stringify(allResults) }
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
    console.error('Failed to parse OrchestratorAgent output:', fullResponse);
    return { error: 'Failed to parse JSON', raw: fullResponse };
  }
}
