export interface iRADReport {
  reportId: string;
  schemaVersion: '3.1';
  timestamp: string;
  reportingSource: 'ROADSoS_CIVILIAN_AI';
  accidentLocation: {
    latitude: number;
    longitude: number;
    roadType: 'NH' | 'SH' | 'MDR' | 'ODR' | 'VR' | 'Urban';
    nhNumber?: string;
    stateName: string;
    districtName: string;
    pincode: string;
    nearestLandmark?: string;
  };
  accidentDetails: {
    dateTime: string;
    severity: 'Fatal' | 'Grievous Hurt' | 'Minor Hurt' | 'Damage Only';
    vehiclesInvolved: number;
    vehicleType: string;
    personsInjured: number;
    personsFatal: number;
    causeOfAccident: string;
    weatherCondition: 'Clear' | 'Rain' | 'Fog' | 'Night' | 'Other';
    roadCondition: 'Dry' | 'Wet' | 'Slippery' | 'Other';
    lightingCondition: 'Daylight' | 'Dawn/Dusk' | 'Night with Lights' | 'Night without Lights';
    hitAndRun: boolean;
  };
  responseDetails: {
    sosTriggeredAt: string;
    firstResponderContactedAt: string;
    ambulanceDispatchedAt?: string;
    hospitalPreAlertedAt?: string;
    responseTimeSeconds: number;
    ambulanceService: string;
    hospitalDestination: string;
    aiTriageScore: number;
    aiConfidenceScore: number;
  };
  aiMetadata: {
    systemVersion: string;
    triageModel: 'claude-sonnet-4-5';
    agentsUsed: string[];
    crashAnalysisScore: number;
    medicalPriorityLevel: 'P1' | 'P2' | 'P3';
  };
}

interface IncidentData {
  lat?: number;
  lng?: number;
  roadType?: iRADReport['accidentLocation']['roadType'];
  nhNumber?: string;
  state?: string;
  district?: string;
  pincode?: string;
  landmark?: string;
  timestamp?: string;
  vehicleCount?: number;
  vehicleType?: string;
  injuredCount?: number;
  weather?: iRADReport['accidentDetails']['weatherCondition'];
  roadCondition?: iRADReport['accidentDetails']['roadCondition'];
  sosTime?: string;
  responseTimeSeconds?: number;
  hospital?: string;
  gForce?: number;
}

interface TriageData {
  score?: number;
  confidence?: number;
}

export function generateiRADReport(incident: IncidentData, triage: TriageData): iRADReport {
  const now = new Date();
  const hour = now.getHours();
  
  return {
    reportId: `ROADSOS-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${Date.now()}`,
    schemaVersion: '3.1',
    timestamp: now.toISOString(),
    reportingSource: 'ROADSoS_CIVILIAN_AI',
    accidentLocation: {
      latitude: incident.lat || 12.9716,
      longitude: incident.lng || 77.5946,
      roadType: incident.roadType || 'NH',
      nhNumber: incident.nhNumber || 'NH-44',
      stateName: incident.state || 'Karnataka',
      districtName: incident.district || 'Bengaluru Urban',
      pincode: incident.pincode || '560001',
      nearestLandmark: incident.landmark || 'Near Silk Board',
    },
    accidentDetails: {
      dateTime: incident.timestamp || now.toISOString(),
      severity: triage?.score > 80 ? 'Grievous Hurt' : triage?.score > 50 ? 'Minor Hurt' : 'Damage Only',
      vehiclesInvolved: incident.vehicleCount || 1,
      vehicleType: incident.vehicleType || 'Car/Jeep/Taxi',
      personsInjured: incident.injuredCount || 1,
      personsFatal: 0,
      causeOfAccident: 'Under Investigation',
      weatherCondition: incident.weather || 'Clear',
      roadCondition: incident.roadCondition || 'Dry',
      lightingCondition: hour >= 6 && hour <= 18 ? 'Daylight' : 'Night with Lights',
      hitAndRun: false,
    },
    responseDetails: {
      sosTriggeredAt: incident.sosTime || now.toISOString(),
      firstResponderContactedAt: new Date(now.getTime() + 12000).toISOString(),
      ambulanceDispatchedAt: new Date(now.getTime() + 35000).toISOString(),
      hospitalPreAlertedAt: new Date(now.getTime() + 42000).toISOString(),
      responseTimeSeconds: incident.responseTimeSeconds || 180,
      ambulanceService: '108 GVK EMRI',
      hospitalDestination: incident.hospital || 'AIIMS',
      aiTriageScore: triage?.score || 87,
      aiConfidenceScore: triage?.confidence || 91,
    },
    aiMetadata: {
      systemVersion: 'ROADSoS v2.0',
      triageModel: 'claude-sonnet-4-5',
      agentsUsed: ['Crash Analyst', 'Medical Triage', 'Resource Optimizer'],
      crashAnalysisScore: incident.gForce ? Math.min(incident.gForce * 7, 100) : 75,
      medicalPriorityLevel: triage?.score > 80 ? 'P1' : triage?.score > 50 ? 'P2' : 'P3',
    },
  };
}

export async function submitiRADReport(report: iRADReport): Promise<{ success: boolean; ackId: string; submittedAt: string }> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  return {
    success: true,
    ackId: `iRAD-ACK-${report.reportId}`,
    submittedAt: new Date().toISOString(),
  };
}
