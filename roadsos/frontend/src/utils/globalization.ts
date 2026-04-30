interface EmergencyProtocols {
  number: string;
  ambulance: string;
  police: string;
  fire: string;
  smsSupport: boolean;
}

const REGIONAL_PROTOCOLS: Record<string, EmergencyProtocols> = {
  'US': { number: '911', ambulance: '911', police: '911', fire: '911', smsSupport: true },
  'IN': { number: '112', ambulance: '102', police: '100', fire: '101', smsSupport: false },
  'UK': { number: '999', ambulance: '999', police: '999', fire: '999', smsSupport: true },
  'EU': { number: '112', ambulance: '112', police: '112', fire: '112', smsSupport: true },
  'DEFAULT': { number: '112', ambulance: '112', police: '112', fire: '112', smsSupport: false }
};

export const getEmergencyProtocol = (countryCode?: string): EmergencyProtocols => {
  return REGIONAL_PROTOCOLS[countryCode?.toUpperCase() || 'DEFAULT'] || REGIONAL_PROTOCOLS['DEFAULT'];
};

export const formatEmergencyNumber = (number: string): string => {
  // Simple formatter
  return `+${number}`;
};

export const detectUserRegion = async (): Promise<string> => {
  try {
    // In a real app, use a geolocation service or browser API
    // For now, we use the browser locale as a proxy
    const locale = navigator.language;
    const country = locale.split('-')[1] || 'DEFAULT';
    return country.toUpperCase();
  } catch {
    return 'DEFAULT';
  }
};
