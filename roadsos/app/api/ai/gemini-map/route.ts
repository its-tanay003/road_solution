import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 503 });
    }

    const { query, center } = await req.json() as {
      query: string;
      center: { lat: number; lng: number };
    };

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const mapCenter = center || { lat: 28.6139, lng: 77.2090 }; // fallback: Delhi

    const systemPrompt = `You are a high-fidelity emergency location discovery AI on the ROADSoS platform.
The user is viewing the map at coordinates: latitude ${mapCenter.lat}, longitude ${mapCenter.lng}.
They are searching for: "${query}".

Based on your knowledge of actual clinics, hospitals, pharmacies, police stations, fire stations, or emergency services, return up to 5 matching facilities.
If the search is general (e.g., "Find nearest trauma center open now"), identify real facilities that would exist near those coordinates.
Since this is an emergency simulator, if you do not know the exact coordinates of facilities near this specific coordinate, generate highly realistic and accurate mock coordinates that are extremely close to the user (e.g., offset the user's current coordinates by a small random factor between -0.015 and +0.015) so they appear in their immediate vicinity on the map viewport.

You MUST respond with a JSON object containing a "places" key. The value of "places" must be an array of objects.
Do not output any markdown formatting, only valid raw JSON.

JSON Schema:
{
  "places": [
    {
      "name": "Full Facility Name",
      "lat": 12.34567, // latitude float
      "lng": 12.34567, // longitude float
      "address": "Street address, City",
      "phone": "Contact number (or emergency helpline if unknown)",
      "description": "Short explanation of why this was selected and what services it has (e.g., '24/7 Level 1 Trauma Center, Specialized in head injuries'). Keep it under 20 words.",
      "type": "hospitals" // Must be one of: "hospitals", "police", "fire", "pharmacy"
    }
  ]
}`;

    const { text } = await generateText({
      model: google('gemini-1.5-pro'),
      system: systemPrompt,
      prompt: `Find places matching "${query}" around coordinates ${mapCenter.lat}, ${mapCenter.lng}`,
      temperature: 0.2,
    });

    // Clean JSON response (strip markdown wrappers if model ignores instructions)
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText) as { places: any[] };
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('[Gemini Map API] Error processing request:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', places: [] }, { status: 500 });
  }
}
