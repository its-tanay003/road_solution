import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();
    
    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ error: 'Recipient phone numbers are required' }, { status: 400 });
    }
    
    // Support either the user's exact requested env names or existing ones
    const sid = process.env.TWILIO_SID || process.env.TWILIO_ACCOUNT_SID || '';
    const token = process.env.TWILIO_TOKEN || process.env.TWILIO_AUTH_TOKEN || '';
    const from = process.env.TWILIO_FROM || process.env.TWILIO_PHONE_NUMBER || '';
    
    if (!sid || !token || !from) {
      console.warn('[Twilio API] Missing environment variables. Mocking SMS dispatch.');
      return NextResponse.json({
        success: true,
        mocked: true,
        message: 'Mock Twilio SMS dispatched successfully (missing credentials)'
      });
    }
    
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const sendPromises = to.map(async (phone) => {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phone,
          From: from,
          Body: message
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to send to ${phone}`);
      }
      return res.json();
    });
    
    const results = await Promise.allSettled(sendPromises);
    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length === to.length) {
      throw new Error(`All SMS sends failed: ${(failures[0] as any).reason?.message}`);
    }
    
    return NextResponse.json({
      success: true,
      detail: `Sent ${to.length - failures.length} out of ${to.length} messages successfully`
    });
  } catch (err: any) {
    console.error('[Twilio API] SMS Route error:', err);
    return NextResponse.json({ error: err.message || 'Internal Twilio SMS Dispatch Error' }, { status: 500 });
  }
}
