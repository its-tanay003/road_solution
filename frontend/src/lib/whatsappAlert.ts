interface EmergencyContact {
  name: string;
  phone: string;
  alertViaWhatsApp: boolean;
}

interface AlertPayload {
  victimName: string;
  lat: number;
  lng: number;
  incidentId: string;
  hospital?: string;
  eta?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export function formatPhone(phone: string, countryCode = '91'): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith(countryCode)) return cleaned;
  return countryCode + cleaned;
}

export function buildEmergencyMessage(payload: AlertPayload): string {
  const mapsUrl = `https://maps.google.com/?q=${payload.lat},${payload.lng}`;
  const trackUrl = `https://roadsos.app/track/${payload.incidentId}`;
  const severityEmoji = payload.severity === 'CRITICAL' ? '🔴' : payload.severity === 'HIGH' ? '🟠' : '🟡';
  
  return `${severityEmoji} EMERGENCY ALERT — ROADSoS

${payload.victimName} has been in a road accident and has triggered an emergency SOS.

📍 Location: ${mapsUrl}
🏥 Hospital: ${payload.hospital || 'Being determined'}
⏱ Ambulance ETA: ${payload.eta || 'Dispatching now'}
🆘 Incident ID: ${payload.incidentId}

Emergency services have been contacted automatically.

Please:
- Stay available on this number
- Head to ${payload.hospital || 'the nearest hospital'} if possible
- Track live updates: ${trackUrl}

Sent automatically by ROADSoS Emergency Intelligence Platform
108 dispatched. You will receive updates every 5 minutes.`;
}

export function openWhatsApp(phone: string, message: string): void {
  const formattedPhone = formatPhone(phone);
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}

export function openSMS(phone: string, message: string): void {
  const shortMessage = message.substring(0, 160);
  window.location.href = `sms:${phone}?body=${encodeURIComponent(shortMessage)}`;
}

export async function sendAllAlerts(contacts: EmergencyContact[], payload: AlertPayload): Promise<{ name: string; method: string; status: 'sent' }[]> {
  const message = buildEmergencyMessage(payload);
  const results: { name: string; method: string; status: 'sent' }[] = [];
  
  for (const contact of contacts) {
    if (contact.alertViaWhatsApp) {
      openWhatsApp(contact.phone, message);
      await new Promise(r => setTimeout(r, 1800));
      results.push({ name: contact.name, method: 'WhatsApp', status: 'sent' as const });
    } else {
      openSMS(contact.phone, message);
      results.push({ name: contact.name, method: 'SMS', status: 'sent' as const });
    }
  }
  return results;
}
