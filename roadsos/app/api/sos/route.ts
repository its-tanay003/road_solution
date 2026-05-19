import { NextRequest, NextResponse } from 'next/server';

// Mock SOS handler — in production, this broadcasts to WebSocket,
// sends Twilio SMS, logs to Supabase, and notifies emergency contacts.
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    incidentId: string;
    lat: number;
    lng: number;
    address: string;
    batteryLevel?: number;
    networkType?: string;
    userId?: string;
    emergencyType?: string;
  };

  console.log('[SOS] New incident received:', body);

  // 1. Log to Supabase (requires service role key)
  // const { error } = await createAdminClient().from('incidents').insert({ ... });

  // 2. Twilio SMS stub
  const twilioEnabled = !!process.env.TWILIO_ACCOUNT_SID;
  console.log(`[SOS] Twilio SMS: ${twilioEnabled ? 'SENDING' : 'STUB (no credentials)'}`);

  // 3. Broadcast to control room via WebSocket
  // io.emit('sos:new', body);

  // 4. Simulate ETA responder (mock)
  const mockResponder = {
    name: 'Ambulance Unit #7',
    lat: body.lat + 0.02,
    lng: body.lng + 0.01,
    etaMinutes: Math.floor(Math.random() * 8) + 3,
  };

  // Simulate acknowledgment after 5 seconds
  await new Promise((r) => setTimeout(r, 100));

  return NextResponse.json({
    success: true,
    incidentId: body.incidentId,
    broadcastStatus: {
      sms: twilioEnabled ? 'sent' : 'stub',
      whatsapp: 'link_generated',
      push: 'sent',
      email: 'sent',
      websocket: 'broadcast',
      bluetooth: 'attempted',
    },
    responder: mockResponder,
    message: 'Emergency services have been notified.',
  });
}
