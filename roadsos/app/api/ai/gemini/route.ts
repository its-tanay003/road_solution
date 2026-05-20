import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 30;

const GEMINI_EMERGENCY_PROMPT = `You are NEXUS Gemini, a fast and accurate emergency response AI on the ROADSoS platform.
Provide real-time, actionable emergency guidance. Be direct and clear.
Emergency numbers (India): 112 (universal), 108 (ambulance), 100 (police), 101 (fire).
Always recommend calling emergency services for life-threatening situations.`;

export async function POST(req: NextRequest) {
  const { messages, systemContext } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    systemContext?: string;
  };

  const result = streamText({
    model: google('gemini-1.5-pro'),
    system: GEMINI_EMERGENCY_PROMPT + (systemContext ? `\n\nContext: ${systemContext}` : ''),
    messages,
    maxOutputTokens: 1024,
    temperature: 0.2,
  });

  return result.toTextStreamResponse();
}
