import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { incidentId, contacts, userName } = await req.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const supabaseConfigured = supabaseUrl.length > 0 && !supabaseUrl.includes('your-project');
    
    // 1. Update incident status in Supabase to 'resolved'
    if (supabaseConfigured) {
      try {
        const supabase = createAdminClient();
        if (supabase && incidentId) {
          await supabase
            .from('incidents')
            .update({ status: 'resolved', resolved_at: new Date().toISOString() })
            .eq('id', incidentId);
        }
      } catch (dbErr) {
        console.warn('[All Clear API] Database update error:', dbErr);
      }
    }
    
    // 2. Broadcast high-priority all-clear SMS via Twilio to emergency contacts
    const sid = process.env.TWILIO_SID || process.env.TWILIO_ACCOUNT_SID || '';
    const token = process.env.TWILIO_TOKEN || process.env.TWILIO_AUTH_TOKEN || '';
    const from = process.env.TWILIO_FROM || process.env.TWILIO_PHONE_NUMBER || '';
    
    const allClearMessage = `💚 ROADSoS Status Update 💚
${userName || 'User'} is now SAFE. The emergency incident has been resolved and marked ALL CLEAR. Thank you for your assistance.`;
    
    if (sid && token && from && Array.isArray(contacts) && contacts.length > 0) {
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const sendPromises = contacts.map(async (c: any) => {
        if (!c.phone) return;
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: c.phone,
            From: from,
            Body: allClearMessage
          })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || `Failed to send to ${c.phone}`);
        }
        return res.json();
      });
      
      await Promise.allSettled(sendPromises);
    } else {
      console.warn('[All Clear API] Twilio variables or emergency contacts missing. Skipped sending resolution SMS.');
    }
    
    return NextResponse.json({
      success: true,
      message: 'All-clear event logged and contacts updated.'
    });
  } catch (err: any) {
    console.error('[All Clear API] Route error:', err);
    return NextResponse.json({ error: err.message || 'Internal All Clear API Error' }, { status: 500 });
  }
}
