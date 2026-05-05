export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export const buildSOSMessage = (
  profileName: string, 
  gps: { lat: number; lng: number }, 
  hospital: { name: string; eta: number }
) => {
  const timestamp = new Date().toLocaleTimeString();
  const mapLink = `https://www.google.com/maps/?q=${gps.lat},${gps.lng}`;
  
  const text = `🚨 ROADSOS EMERGENCY ALERT\n${profileName} triggered SOS.\nLocation: ${mapLink}\nTime: ${timestamp}\nNearest Hospital: ${hospital.name} (ETA: ${hospital.eta} min)\nAutomated message from ROADSoS.`;
  
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
