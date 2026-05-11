export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export const buildSOSMessage = (
  profileName: string, 
  gps: { lat: number; lng: number }, 
  hospital: { name: string; eta: number },
  vitals?: { hr: number; spO2: number; battery: number }
) => {
  const timestamp = new Date().toLocaleTimeString();
  const mapLink = `https://www.google.com/maps/?q=${gps.lat},${gps.lng}`;
  
  let text = `🚨 *ROADSOS EMERGENCY ALERT* 🚨\n\n`;
  text += `*${profileName}* triggered SOS.\n`;
  text += `Time: ${timestamp}\n`;
  text += `📍 Location: ${mapLink}\n\n`;

  if (vitals) {
    text += `*VITALS (Live):*\n`;
    text += `❤️ HR: ${vitals.hr} bpm\n`;
    text += `🫁 SpO2: ${vitals.spO2}%\n`;
    text += `🔋 Device: ${vitals.battery}%\n\n`;
  }

  text += `Nearest: ${hospital.name} (ETA: ${hospital.eta} min)\n\n`;
  text += `— Automated message via ROADSoS AI`;
  
  return encodeURIComponent(text);
};

export const getWhatsAppLink = (phone: string, message: string) => {
  // Ensure Indian format +91 if not present
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }
  return `https://wa.me/${formattedPhone}?text=${message}`;
};

export const buildStatusUpdateMessage = (status: 'DISPATCHED' | 'ARRIVED' | 'RESOLVED', location?: string) => {
  let text = '';
  switch (status) {
    case 'DISPATCHED':
      text = `🚑 ROADSoS UPDATE: Ambulance has been dispatched to ${location || 'the incident location'}.`;
      break;
    case 'ARRIVED':
      text = `✅ ROADSoS UPDATE: Responders have arrived at the scene.`;
      break;
    case 'RESOLVED':
      text = `🏁 ROADSoS UPDATE: The emergency has been resolved. [Patient safely transported/assisted]`;
      break;
  }
  return encodeURIComponent(text);
};
