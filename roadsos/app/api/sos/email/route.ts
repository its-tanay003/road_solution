import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const sosData = await req.json();
    const { name, age, bloodGroup, conditions, allergies, lat, lng, address, battery, network, speed, timestamp, deviceInfo, emergencyContacts } = sosData;
    
    const resendKey = process.env.RESEND_KEY || process.env.RESEND_API_KEY || '';
    const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    
    // Construct HTML Email Content with premium emergency styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>⚠️ ROADSoS EMERGENCY ALERT ⚠️</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #111827; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #ef4444; }
            .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: 1px; }
            .header p { margin: 10px 0 0 0; color: #fca5a5; font-size: 14px; }
            .content { padding: 30px 20px; }
            .bento-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
            .bento-card { background: #1f2937; padding: 15px; border-radius: 8px; border: 1px solid #374151; }
            .bento-card-full { grid-column: span 2; background: #1f2937; padding: 15px; border-radius: 8px; border: 1px solid #ef4444; }
            .label { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px; margin-bottom: 5px; }
            .value { font-size: 16px; font-weight: bold; color: #ffffff; }
            .value-red { color: #f87171; font-weight: 800; }
            .btn-action { display: block; width: 100%; text-align: center; background: #ef4444; color: #ffffff; text-decoration: none; padding: 15px 0; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 25px 0; box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.4); }
            .btn-action:hover { background: #dc2626; }
            .footer { padding: 20px; text-align: center; border-top: 1px solid #374151; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 EMERGENCY SOS ACTIVE</h1>
              <p>ROADSoS system detected an incident and initiated a high-priority beacon</p>
            </div>
            
            <div class="content">
              <div class="bento-grid">
                <div class="bento-card">
                  <div class="label">Name</div>
                  <div class="value">${name}</div>
                </div>
                <div class="bento-card">
                  <div class="label">Age</div>
                  <div class="value">${age}</div>
                </div>
                
                <div class="bento-card">
                  <div class="label">Blood Group</div>
                  <div class="value value-red">${bloodGroup}</div>
                </div>
                <div class="bento-card">
                  <div class="label">Speed</div>
                  <div class="value">${Math.round(speed * 3.6)} km/h</div>
                </div>
                
                <div class="bento-card-full">
                  <div class="label">Medical Conditions</div>
                  <div class="value">${conditions || 'None Declared'}</div>
                </div>
                <div class="bento-card-full">
                  <div class="label">Allergies</div>
                  <div class="value">${allergies || 'None Declared'}</div>
                </div>
                
                <div class="bento-card-full">
                  <div class="label">Current Location Address</div>
                  <div class="value">${address}</div>
                </div>
                
                <div class="bento-card">
                  <div class="label">Coordinates</div>
                  <div class="value">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
                </div>
                <div class="bento-card">
                  <div class="label">Battery Status</div>
                  <div class="value">${battery}%</div>
                </div>
              </div>
              
              <a href="${mapsLink}" class="btn-action" target="_blank">🗺️ VIEW LIVE POSITION ON GOOGLE MAPS</a>
              
              <div style="background: #111827; padding: 15px; border-radius: 8px; border: 1px solid #374151; font-size: 13px;">
                <strong style="color: #ffffff;">Telemetry Details:</strong><br>
                <strong>Network Type:</strong> ${network}<br>
                <strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}<br>
                <strong>User Agent Info:</strong> ${deviceInfo}
              </div>
            </div>
            
            <div class="footer">
              This is an automated high-priority emergency message sent from the ROADSoS Network.
            </div>
          </div>
        </body>
      </html>
    `;
    
    if (!resendKey || resendKey.includes('your-')) {
      console.warn('[Resend API] RESEND_KEY is missing. Simulating email broadcast.');
      return NextResponse.json({
        success: true,
        mocked: true,
        message: 'Mock emergency email broadcast dispatched successfully (missing RESEND_KEY)'
      });
    }
    
    // Broadcast to registered contacts via Resend API
    const recipients = emergencyContacts && Array.isArray(emergencyContacts) && emergencyContacts.length > 0
      ? emergencyContacts.map((c: any) => c.email).filter(Boolean)
      : ['emergency-alerts@roadsos.net']; // Fallback alerts dump
      
    if (recipients.length === 0) {
      return NextResponse.json({ success: true, detail: 'No contact emails registered' });
    }
    
    const sendPromises = recipients.map(async (emailAddress: string) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ROADSoS Alerts <alerts@roadsos.net>',
          to: emailAddress,
          subject: `🚨 EMERGENCY ALERT: ${name} is in distress 🚨`,
          html: htmlContent
        })
      });
      
      if (!response.ok) {
        const errDetails = await response.text();
        throw new Error(errDetails || `Failed email send to ${emailAddress}`);
      }
      return response.json();
    });
    
    const sendResults = await Promise.allSettled(sendPromises);
    const failures = sendResults.filter(r => r.status === 'rejected');
    
    if (failures.length === recipients.length) {
      throw new Error(`All email dispatches failed: ${(failures[0] as any).reason?.message}`);
    }
    
    return NextResponse.json({
      success: true,
      detail: `Emails successfully sent to ${recipients.length - failures.length} emergency contacts`
    });
  } catch (err: any) {
    console.error('[Email API] Route error:', err);
    return NextResponse.json({ error: err.message || 'Internal Email API Error' }, { status: 500 });
  }
}
