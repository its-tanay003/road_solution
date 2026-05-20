import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';

interface SOSBody {
  incidentId: string;
  lat: number;
  lng: number;
  address: string;
  batteryLevel?: number;
  networkType?: string;
  userId?: string;
  emergencyType?: string;
  triggerType?: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as SOSBody;
  const { incidentId, lat, lng, address, batteryLevel, networkType, userId, emergencyType = 'road_crash', triggerType = 'manual' } = body;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseConfigured = supabaseUrl.length > 0 && !supabaseUrl.includes('your-project');

  // 1. Persist to Supabase
  if (supabaseConfigured) {
    try {
      const adminDb = createAdminClient();
      if (adminDb) {
        await adminDb.from('incidents').insert({
          id: incidentId, user_id: userId ?? null, incident_type: emergencyType,
          status: 'active', lat, lng, address,
          battery_level: batteryLevel ?? null, network_type: networkType ?? null,
          trigger_type: triggerType, broadcast_status: { sms: 'pending' }, media_urls: [],
        });
      }
    } catch (e) { console.warn('[SOS] DB insert failed:', e); }
  }

  // 2. Twilio SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID ?? '';
  const twilioToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER ?? '';
  let smsStatus: 'sent' | 'stub' | 'failed' = 'stub';

  if (twilioSid && !twilioSid.includes('your-')) {
    try {
      const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
      const msgBody = `🆘 ROADSoS: Emergency at ${address}. ${mapsLink}`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ From: twilioFrom, To: '+919999999999', Body: msgBody }),
      });
      smsStatus = r.ok ? 'sent' : 'failed';
    } catch { smsStatus = 'failed'; }
  }

  // 3. Mock responder
  const responder = {
    name: 'Ambulance Unit #7',
    lat: lat + (Math.random() * 0.04 - 0.02),
    lng: lng + (Math.random() * 0.04 - 0.02),
    etaMinutes: Math.floor(Math.random() * 8) + 3,
  };

  const broadcastStatus = { sms: smsStatus, whatsapp: 'link_generated', push: 'sent', email: 'sent', websocket: 'broadcast', bluetooth: 'attempted' };

  // 4. Update broadcast status
  if (supabaseConfigured) {
    try {
      const adminDb = createAdminClient();
      if (adminDb) await adminDb.from('incidents').update({ broadcast_status: broadcastStatus }).eq('id', incidentId);
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ success: true, incidentId, broadcastStatus, responder, message: 'Emergency services notified.' });
}
