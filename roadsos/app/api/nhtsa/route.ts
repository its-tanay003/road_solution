import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://crashviewer.nhtsa.dot.gov/CrashAPI/crashes/GetCaseList?states=1&fromYear=2022&toYear=2023&minSeverity=1&format=json';
    
    // Attempt to fetch from NHTSA
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour to avoid spamming the API
    });

    if (!response.ok) {
      throw new Error(`NHTSA API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/NHTSA] Proxy Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch NHTSA data' }, { status: 502 });
  }
}
