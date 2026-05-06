import express, { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';

const router = express.Router();

// Attach io instance so we can emit dispatch_update events
let _io: SocketServer | null = null;
export const attachDispatchIo = (io: SocketServer) => { _io = io; };



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
