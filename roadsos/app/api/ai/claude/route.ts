import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { checkRateLimit, rateLimitedResponse } from '@/lib/server/rate-limit';

export const runtime = 'edge';
export const maxDuration = 30;

const EMERGENCY_SYSTEM_PROMPT = `You are NEXUS, an advanced AI emergency response assistant integrated into the ROADSoS platform.
Your role is to provide clear, calm, and life-saving guidance in emergency situations.

Core principles:
- ALWAYS prioritize immediate life safety above all else
- Provide step-by-step instructions that are easy to follow under stress
- Be concise but thorough — every word matters in an emergency
- If you don't know something, say so clearly and direct to 112/108
- Never provide information that could worsen the situation
- Respond in the same language the user writes in

Emergency numbers (India): 112 (universal), 108 (ambulance), 100 (police), 101 (fire), 181 (women helpline)`;

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, { keyPrefix: 'ai:claude', limit: 30, windowMs: 60_000 });
  if (!limit.allowed) return rateLimitedResponse(limit);

  const { messages, systemContext } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    systemContext?: string;
  };

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: EMERGENCY_SYSTEM_PROMPT + (systemContext ? `\n\nCurrent context: ${systemContext}` : ''),
    messages,
    maxOutputTokens: 1024,
    temperature: 0.3,
  });

  return result.toTextStreamResponse();
}
