import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

interface TriageMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      messages: TriageMessage[];
      medicalProfile?: Record<string, unknown>;
    };

    const { messages, medicalProfile } = body;

    const systemPrompt = `You are a highly trained, rapid-response First Aid & Triage AI for the ROADSoS emergency app.
Your goal is to provide immediate, actionable, and safe first-aid instructions before professional help arrives.

CRITICAL MEDICAL PROFILE of the user/victim:
${medicalProfile ? JSON.stringify(medicalProfile, null, 2) : 'No specific medical conditions known. Assume healthy adult.'}

RULES:
1. Always adapt your instructions based on the medical profile (e.g., if diabetic, consider hypoglycemia; if on blood thinners, emphasize stopping bleeding).
2. Use short, punchy sentences. Format with **bold** for critical steps.
3. Be calm, authoritative, and clear. Use bullet points for steps.
4. Always remind them to ensure the scene is safe and 112 is called if the situation is life-threatening.
5. Keep responses concise — maximum 200 words unless detail is critical.`;

    const result = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages,
      system: systemPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[Triage API]', error);
    return new Response('Error processing triage request', { status: 500 });
  }
}
