import express from 'express';

const router = express.Router();

// Mock NHTSA Incident Data
router.get('/nhtsa/incidents', (req, res) => {
  const mockIncidents = Array.from({ length: 10 }).map((_, i) => ({
    caseNumber: `NHTSA-2026-${1000 + i}`,
    location: {
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
    },
    severity: Math.floor(Math.random() * 5) + 1,
    vehicleType: ['Passenger Car', 'Light Truck', 'Motorcycle', 'Bus'][Math.floor(Math.random() * 4)],
    timestamp: new Date().toISOString(),
  }));
  
  res.json({ source: 'NHTSA FARS (Fatality Analysis Reporting System)', incidents: mockIncidents });
});

// Mock CAD (Computer-Aided Dispatch) Integration
router.post('/cad/dispatch', (req, res) => {
  const { incidentId, unitId, location } = req.body;
  
  const cadResponse = {
    cadTicketNumber: `CAD-${Math.floor(Math.random() * 1000000)}`,
    dispatchTime: new Date().toISOString(),
    priorityCode: 'P1',
    assignedUnit: unitId || 'ALS-42',
    incidentId: incidentId || 'SOS-789',
    status: 'DISPATCHED',
    enRouteTime: new Date(Date.now() + 15000).toISOString(),
  };
  
  res.json({ 
    message: 'CAD Dispatch Order Transmitted Successfully', 
    response: cadResponse 
  });
});

// Mock WHO Global Health Registry Reporting
router.post('/who/report', (req, res) => {
  const { incidentData } = req.body;
  
  res.json({
    status: 'SUBMITTED',
    reportId: `WHO-ICD10-${Math.floor(Math.random() * 1000000)}`,
    submittedAt: new Date().toISOString(),
    globalRegistryId: `REG-${Math.floor(Math.random() * 1000000)}`,
    format: 'ICD-10-CM',
    message: 'Emergency incident logged in WHO Global Road Safety Database'
  });
});

// Mock Hospital Availability System
router.get('/hospital/availability', (req, res) => {
  const hospitals = [
    { hospitalId: 'H1', name: 'AIIMS Trauma Centre', traumaLevel: 1, availableBeds: 12, erWaitMinutes: 5, distanceKm: 2.4 },
    { hospitalId: 'H2', name: 'Safdarjung Hospital', traumaLevel: 1, availableBeds: 4, erWaitMinutes: 18, distanceKm: 3.1 },
    { hospitalId: 'H3', name: 'Max Super Speciality', traumaLevel: 2, availableBeds: 28, erWaitMinutes: 2, distanceKm: 5.7 },
    { hospitalId: 'H4', name: 'Fortis Escorts', traumaLevel: 2, availableBeds: 15, erWaitMinutes: 0, distanceKm: 7.2 },
  ];
  
  res.json({
    lastUpdated: new Date().toISOString(),
    hospitals: hospitals.map(h => ({
      ...h,
      status: h.availableBeds > 5 ? 'OPTIMAL' : 'CRITICAL'
    }))
  });
});

export default router;
