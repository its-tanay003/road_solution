import express, { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';

const router = express.Router();

// Attach io instance so we can emit dispatch_update events
let _io: SocketServer | null = null;
export const attachDispatchIo = (io: SocketServer) => { _io = io; };

/* ─────────────────────────────────────────────────────────────
   POST /api/dispatch/108
   Accepts incident payload → returns mock GVK EMRI response
   Also starts a Socket.io countdown every 30s
───────────────────────────────────────────────────────────── */
router.post('/108', (req: Request, res: Response) => {
  const { incident_id, location, severity } = req.body as {
    incident_id?: string;
    location?: { lat: number; lng: number; address: string };
    severity?: string;
  };

  const unitNumber = Math.floor(Math.random() * 15) + 1;
  const etaMinutes = severity === 'critical' ? 8 : 12;

  const dispatchResponse = {
    dispatched: true,
    unit: `TN-108-GVK-ALS-${String(unitNumber).padStart(2, '0')}`,
    eta_minutes: etaMinutes,
    driver: 'Murugan K.',
    contact: '+91-9876543210',
    ambulance_type: 'Advanced Life Support',
    dispatch_time: new Date().toISOString(),
    incident_id: incident_id ?? `RS-TN-${Date.now()}`,
    dispatch_center: 'Kancheepuram 108 Control Room',
    protocol: 'GVK EMRI Standard Response Protocol v3.2',
  };

  // Start ETA countdown over Socket.io every 30 seconds
  if (_io && incident_id) {
    let remaining = etaMinutes;
    const interval = setInterval(() => {
      remaining = Math.max(0, remaining - 0.5);
      _io!.emit('dispatch_update', {
        incident_id,
        unit: dispatchResponse.unit,
        eta_minutes: remaining,
        status: remaining === 0 ? 'ARRIVED' : 'EN_ROUTE',
      });
      if (remaining === 0) clearInterval(interval);
    }, 30_000);
  }

  res.json(dispatchResponse);
});

/* ─────────────────────────────────────────────────────────────
   GET /api/dispatch/108/status/:incidentId
   Returns current mock dispatch status
───────────────────────────────────────────────────────────── */
router.get('/108/status/:incidentId', (req: Request, res: Response) => {
  res.json({
    incident_id: req.params.incidentId,
    unit: 'TN-108-GVK-ALS-07',
    eta_minutes: 5,
    status: 'EN_ROUTE',
    last_known_position: { lat: 12.8502, lng: 80.1489 },
  });
});

/* ─────────────────────────────────────────────────────────────
   POST /api/notify/whatsapp
   Returns a mock WhatsApp Business API send receipt
───────────────────────────────────────────────────────────── */
router.post('/whatsapp', (req: Request, res: Response) => {
  const { contact_number, victim_name, location_url, incident_id, eta_minutes } = req.body as {
    contact_number: string;
    victim_name: string;
    location_url: string;
    incident_id: string;
    eta_minutes: number;
  };

  const messageText = [
    `[ROADSoS Emergency Alert]`,
    `🆘 ${victim_name ?? 'Your contact'} may be in an emergency.`,
    `📍 Location: NH-48, KM 43.2, Sriperumbudur`,
    `🗺️ Maps: ${location_url ?? 'https://maps.google.com/?q=12.84,80.15'}`,
    `🚑 Ambulance dispatched. ETA: ${eta_minutes ?? 8} minutes.`,
    `⏱️ Incident: 2 minutes ago`,
    `Incident ID: ${incident_id ?? 'RS-TN-2026-003847'}`,
    `Reply SAFE if this is a false alarm.`,
  ].join('\n');

  res.json({
    success: true,
    message_id: `wamid.HBgL${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    to: contact_number,
    status: 'sent',
    timestamp: new Date().toISOString(),
    preview: messageText,
    note: 'WhatsApp Business API integration ready — pending Business Account approval',
  });
});

export default router;
