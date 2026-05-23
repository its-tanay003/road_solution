import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitedResponse } from '@/lib/server/rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, { keyPrefix: 'voice:whisper', limit: 20, windowMs: 60_000 });
  if (!limit.allowed) return rateLimitedResponse(limit);

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey && !geminiApiKey) {
      return NextResponse.json({ error: 'No transcription API keys configured' }, { status: 503 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('file');
    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Fall back to Gemini if OpenAI key is missing but Gemini key is available
    if (!apiKey && geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const arrayBuffer = await audioFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, chunk as any);
        }
        const base64Audio = btoa(binaryString);

        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Audio,
              mimeType: audioFile.type || 'audio/wav',
            },
          },
          'Transcribe the audio speech accurately. Return ONLY the transcribed text. Do not add any preamble, explanations, formatting, punctuation wrapping (like quotes), or additional text.',
        ]);

        const text = result.response.text().trim();
        return NextResponse.json({ text });
      } catch (geminiErr: any) {
        console.error('[Gemini Transcription Fallback] Error:', geminiErr);
        return NextResponse.json({ error: `Gemini transcription failed: ${geminiErr.message}` }, { status: 500 });
      }
    }

    // Prepare OpenAI transcriptions payload if OpenAI key is present
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
