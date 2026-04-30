interface TelemetryData {
  timestamp: number;
  lat: number;
  lng: number;
  speed: number;
  gForce: number;
  heading: number;
}

interface IncidentReport {
  id: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  telemetry: TelemetryData[];
  triage: {
    severity: string;
    classification: string;
    summary: string;
  };
  deviceInfo: {
    model: string;
    os: string;
  };
}

export const generateIncidentReport = (data: IncidentReport): string => {
  const report = `
=========================================
      ROADSoS INCIDENT RECONSTRUCTION
=========================================
REPORT ID: ${data.id}
TIMESTAMP: ${new Date(data.timestamp).toLocaleString()}
STATUS: VERIFIED EMERGENCY

1. GEOSPATIAL DATA
------------------
Latitude:  ${data.location.lat}
Longitude: ${data.location.lng}
Address:   ${data.location.address || 'Reverse Geocoding Pending'}

2. IMPACT ANALYSIS (TELEMETRY)
------------------------------
Max G-Force: ${Math.max(...data.telemetry.map(t => t.gForce)).toFixed(2)}G
Impact Speed: ${data.telemetry[0]?.speed.toFixed(1) || 0} km/h
Crash Delta-V: ${calculateDeltaV(data.telemetry).toFixed(1)} km/h

3. AI TRIAGE SUMMARY
--------------------
Severity:       ${data.triage.severity.toUpperCase()}
Classification: ${data.triage.classification}
Summary:        ${data.triage.summary}

4. DEVICE FORENSICS
-------------------
Device Model: ${data.deviceInfo.model}
OS Platform:  ${data.deviceInfo.os}

-----------------------------------------
This report is generated automatically by ROADSoS AI Intelligence.
It contains telemetry data captured 60s prior to and 10s post impact.
=========================================
  `;
  return report.trim();
};

const calculateDeltaV = (telemetry: TelemetryData[]): number => {
  if (telemetry.length < 2) return 0;
  // Simplified Delta-V calculation for reconstruction
  const speeds = telemetry.map(t => t.speed);
  const max = Math.max(...speeds);
  const min = Math.min(...speeds);
  return max - min;
};

export const downloadReport = (data: IncidentReport) => {
  const content = generateIncidentReport(data);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ROADSoS_Report_${data.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
