import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitedResponse } from '@/lib/server/rate-limit';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, { keyPrefix: 'voice:whisper', limit: 20, windowMs: 60_000 });
  if (!limit.allowed) return rateLimitedResponse(limit);

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('file');
    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Prepare OpenAI transcriptions payload
    const openAiFormData = new FormData();
    openAiFormData.append('file', audioFile);
    openAiFormData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Whisper API failed: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ text: result.text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
