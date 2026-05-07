export interface CountryProfile {
  code: string;
  name: string;
  flag: string;
  emergencyNumbers: {
    ambulance: string;
    police: string;
    fire: string;
    main: string;
    highway?: string;
  };
  language: string;
  currency: string;
  drivingSide: 'left' | 'right';
  trafficLawsUrl: string;
  overpassRegion: string;
  mapCenter: [number, number];
  timeZone: string;
  capital: string;
  capitalCoords: [number, number];
  hospitalDensityNote: string;
  specialServices: string[];
}

export const COUNTRY_PROFILES: Record<string, CountryProfile> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    emergencyNumbers: { ambulance: "108", police: "100", fire: "101", main: "112", highway: "1033" },
    language: "hi",
    currency: "INR",
    drivingSide: "left",
    trafficLawsUrl: "https://morth.nic.in",
    overpassRegion: "India",
    mapCenter: [20.5937, 78.9629],
    timeZone: "Asia/Kolkata",
    capital: "New Delhi",
    capitalCoords: [28.6139, 77.2090],
    hospitalDensityNote: "AIIMS network + District hospitals",
    specialServices: ["EMRI 108 network", "NHAI highway patrol", "Green corridor hospitals"]
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    emergencyNumbers: { ambulance: '112', police: '112', fire: '112', main: '112' },
    language: "en",
    currency: "USD",
    drivingSide: "right",
    trafficLawsUrl: "https://morth.nic.in",
    overpassRegion: "United States",
    mapCenter: [37.0902, -95.7129],
    timeZone: "America/New_York",
    capital: "Washington D.C.",
    capitalCoords: [38.9072, -77.0369],
    hospitalDensityNote: "Trauma Level 1-4 certification system",
    specialServices: ["112 Dispatch", "Poison Control", "Coast Guard"]
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    emergencyNumbers: { ambulance: "999", police: "999", fire: "999", main: "112" },
    language: "en",
    currency: "GBP",
    drivingSide: "left",
    trafficLawsUrl: "https://www.gov.uk/browse/driving",
    overpassRegion: "United Kingdom",
    mapCenter: [55.3781, -3.4360],
    timeZone: "Europe/London",
    capital: "London",
    capitalCoords: [51.5074, -0.1278],
    hospitalDensityNote: "NHS Trust network",
    specialServices: ["NHS 111", "Air Ambulance UK", "Coastguard"]
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    emergencyNumbers: { ambulance: "000", police: "000", fire: "000", main: "000" },
    language: "en",
    currency: "AUD",
    drivingSide: "left",
    trafficLawsUrl: "https://www.infrastructure.gov.au",
    overpassRegion: "Australia",
    mapCenter: [-25.2744, 133.7751],
    timeZone: "Australia/Sydney",
    capital: "Canberra",
    capitalCoords: [-35.2809, 149.1300],
    hospitalDensityNote: "Public & Private hospital networks",
    specialServices: ["Royal Flying Doctor Service", "SES", "Surf Life Saving"]
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    emergencyNumbers: { ambulance: "112", police: "110", fire: "112", main: "112" },
    language: "de",
    currency: "EUR",
    drivingSide: "right",
    trafficLawsUrl: "https://www.bmvi.de",
    overpassRegion: "Germany",
    mapCenter: [51.1657, 10.4515],
    timeZone: "Europe/Berlin",
    capital: "Berlin",
    capitalCoords: [52.5200, 13.4050],
    hospitalDensityNote: "University Clinics & Local Hospitals",
    specialServices: ["ADAC Luftrettung", "Technisches Hilfswerk", "Johanniter"]
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    emergencyNumbers: { ambulance: "119", police: "110", fire: "119", main: "119" },
    language: "ja",
    currency: "JPY",
    drivingSide: "left",
    trafficLawsUrl: "https://www.npa.go.jp",
    overpassRegion: "Japan",
    mapCenter: [36.2048, 138.2529],
    timeZone: "Asia/Tokyo",
    capital: "Tokyo",
    capitalCoords: [35.6762, 139.6503],
    hospitalDensityNote: "Prefectural & Municipal Medical Centers",
    specialServices: ["Doctor-Heli", "JRC Rescue", "Disaster Medical Assistance"]
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    emergencyNumbers: { ambulance: "995", police: "999", fire: "995", main: "995" },
    language: "en",
    currency: "SGD",
    drivingSide: "left",
    trafficLawsUrl: "https://www.lta.gov.sg",
    overpassRegion: "Singapore",
    mapCenter: [1.3521, 103.8198],
    timeZone: "Asia/Singapore",
    capital: "Singapore",
    capitalCoords: [1.3521, 103.8198],
    hospitalDensityNote: "SingHealth & NUHS clusters",
    specialServices: ["SCDF", "SPF", "Public Health Preparedness Clinics"]
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    emergencyNumbers: { ambulance: "998", police: "999", fire: "997", main: "999" },
    language: "ar",
    currency: "AED",
    drivingSide: "right",
    trafficLawsUrl: "https://www.rta.ae",
    overpassRegion: "United Arab Emirates",
    mapCenter: [23.4241, 53.8478],
    timeZone: "Asia/Dubai",
    capital: "Abu Dhabi",
    capitalCoords: [24.4539, 54.3773],
    hospitalDensityNote: "SEHA & Private Healthcare networks",
    specialServices: ["National Ambulance", "Dubai Police Rescue", "Civil Defense"]
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    emergencyNumbers: { ambulance: "192", police: "190", fire: "193", main: "190" },
    language: "pt",
    currency: "BRL",
    drivingSide: "right",
    trafficLawsUrl: "https://www.gov.br/infraestrutura",
    overpassRegion: "Brazil",
    mapCenter: [-14.2350, -51.9253],
    timeZone: "America/Sao_Paulo",
    capital: "Brasília",
    capitalCoords: [-15.7975, -47.8919],
    hospitalDensityNote: "SUS (Public) & Supplemental Health networks",
    specialServices: ["SAMU", "Corpo de Bombeiros", "Polícia Rodoviária"]
  },
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    emergencyNumbers: { ambulance: "10177", police: "10111", fire: "10177", main: "112" },
    language: "en",
    currency: "ZAR",
    drivingSide: "left",
    trafficLawsUrl: "https://www.transport.gov.za",
    overpassRegion: "South Africa",
    mapCenter: [-30.5595, 22.9375],
    timeZone: "Africa/Johannesburg",
    capital: "Pretoria",
    capitalCoords: [-25.7479, 28.2293],
    hospitalDensityNote: "Public-Private healthcare mix",
    specialServices: ["ER24", "Netcare 911", "National Sea Rescue Institute"]
  }
};
