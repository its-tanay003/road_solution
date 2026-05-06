import { Router } from 'express';
import type { Server } from 'socket.io';

const router = Router();

const EMRI_FLEET = [
  { unitId: 'KA-108-001', state: 'Karnataka', city: 'Bengaluru', type: 'ALS', status: 'AVAILABLE', lat: 12.9716, lng: 77.5946, paramedic: 'Ravi Kumar', driver: 'Suresh B', vehicle: 'Tata Winger 2023', certifications: ['ALS','ACLS','Trauma'] },
  { unitId: 'KA-108-002', state: 'Karnataka', city: 'Bengaluru', type: 'BLS', status: 'AVAILABLE', lat: 12.9352, lng: 77.6245, paramedic: 'Priya Sharma', driver: 'Mahesh R', vehicle: 'Force Traveller 2022', certifications: ['BLS','CPR'] },
  { unitId: 'MH-108-001', state: 'Maharashtra', city: 'Mumbai', type: 'ALS', status: 'AVAILABLE', lat: 19.0760, lng: 72.8777, paramedic: 'Dr. Anjali Patil', driver: 'Ramesh D', vehicle: 'Tata Winger 2024', certifications: ['ALS','ACLS','Pediatric'] },
  { unitId: 'DL-108-001', state: 'Delhi', city: 'New Delhi', type: 'ALS', status: 'AVAILABLE', lat: 28.6139, lng: 77.2090, paramedic: 'Dr. Amit Singh', driver: 'Vijay K', vehicle: 'Tata Winger 2024', certifications: ['ALS','ACLS','Trauma','Burn'] },
  { unitId: 'TN-108-001', state: 'Tamil Nadu', city: 'Chennai', type: 'ALS', status: 'AVAILABLE', lat: 13.0827, lng: 80.2707, paramedic: 'Meena R', driver: 'Kumar S', vehicle: 'Force Traveller 2023', certifications: ['ALS','ACLS'] },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Mounted at /api/dispatch/108
router.post('/', async (req, res) => {
  const { incidentLat, incidentLng, severity, injuryType, requiresALS } = req.body;
  const io: Server = req.app.get('io');

  const available = EMRI_FLEET.filter(u => u.status === 'AVAILABLE' && (!requiresALS || u.type === 'ALS'));
  if (available.length === 0) {
    return res.status(503).json({ error: 'No units currently available. Contacting backup network.' });
  }

  const nearest = available.reduce((best, unit) => {
    const d = haversineKm(unit.lat, unit.lng, incidentLat, incidentLng);
    const bd = haversineKm(best.lat, best.lng, incidentLat, incidentLng);
    return d < bd ? unit : best;
  });

  const distKm = haversineKm(nearest.lat, nearest.lng, incidentLat, incidentLng);
  const etaSeconds = Math.round((distKm / 40) * 3600); // 40 km/h average

  nearest.status = 'DISPATCHED';

  // Simulate real-time position updates
  let progress = 0;
  const steps = Math.ceil(etaSeconds / 5);
  const interval = setInterval(() => {
    progress = Math.min(progress + (1 / steps), 1);
    const currentLat = nearest.lat + (incidentLat - nearest.lat) * progress;
    const currentLng = nearest.lng + (incidentLng - nearest.lng) * progress;
    const remainingEta = Math.round(etaSeconds * (1 - progress));

    io?.emit('unit:position', {
      unitId: nearest.unitId,
      lat: currentLat,
      lng: currentLng,
      etaSeconds: remainingEta,
      progress,
      status: progress < 0.95 ? 'EN_ROUTE' : 'APPROACHING',
    });

    if (progress >= 1) {
      clearInterval(interval);
      nearest.status = 'AVAILABLE';
      io?.emit('unit:on_scene', { unitId: nearest.unitId, incidentLat, incidentLng, timestamp: new Date().toISOString() });
    }
  }, 5000);

  res.json({
    dispatched: true,
    dispatchId: `EMRI-${Date.now()}`,
    dispatchTime: new Date().toISOString(),
    callCenter: `108 ${nearest.state} Control Room`,
    unit: {
      unitId: nearest.unitId,
      type: nearest.type,
      paramedic: nearest.paramedic,
      driver: nearest.driver,
      vehicle: nearest.vehicle,
      certifications: nearest.certifications,
      status: 'DISPATCHED',
    },
    eta: {
      seconds: etaSeconds,
      minutes: Math.floor(etaSeconds / 60),
      display: `${Math.floor(etaSeconds/60)}m ${etaSeconds%60}s`,
    },
    distanceKm: Math.round(distKm * 10) / 10,
  });
});

export default router;
