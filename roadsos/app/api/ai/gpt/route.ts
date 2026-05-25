import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitedResponse } from '@/lib/server/rate-limit';

export const runtime = 'edge';
export const maxDuration = 30;

const GPT_EMERGENCY_PROMPT = `You are NEXUS GPT, an emergency response AI on the ROADSoS platform.
Provide accurate, step-by-step emergency guidance. Prioritize user safety.
Emergency numbers (India): 112, 108 (ambulance), 100 (police), 101 (fire).
Be concise, calm, and actionable. Respond in the user's language.`;

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, { keyPrefix: 'ai:gpt', limit: 30, windowMs: 60_000 });
  if (!limit.allowed) return rateLimitedResponse(limit);

  const { messages, systemContext } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    systemContext?: string;
  };

  const result = streamText({
    model: openai('gpt-4o'),
    system: GPT_EMERGENCY_PROMPT + (systemContext ? `\n\nContext: ${systemContext}` : ''),
    messages,
    maxTokens: 1024,
    temperature: 0.3,
  });

  return result.toTextStreamResponse();
}
