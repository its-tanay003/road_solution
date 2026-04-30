import { Router } from 'express';
import { pool } from '../db/connection';
import { sendSosSms } from '../services/twilioService';
import { broadcastLocationUpdate } from '../services/socketService';
import { redisClient } from '../services/cacheService';
import { enqueueSos } from '../services/queueService';
import { SwarmIntelligenceEngine } from '../services/swarmIntelligence';
import { VoiceCallBridge } from '../services/voiceCallBridge';
import { adapterManager } from '../services/adapters/adapterManager';
import crypto from 'crypto';

const router = Router();

// Trigger SOS
router.post('/trigger', async (req, res) => {
  const { deviceId, lat, lng, contactPhones, medicalProfile, blackboxData, emotionalState, networkCondition } = req.body;
  
  if (!deviceId || !lat || !lng) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await pool.query(
      `INSERT INTO sos_events (device_id, location, tracking_token, tracking_expires_at) 
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5) RETURNING id`,
      [deviceId, lng, lat, token, expiresAt]
    );

    const sosEventId = result.rows[0].id;
    let contactsNotified = 0;
    
    if (contactPhones && Array.isArray(contactPhones)) {
      for (const phone of contactPhones) {
        const message = `EMERGENCY: SOS triggered by device ${deviceId}. Location: https://maps.google.com/?q=${lat},${lng}. Live tracking: ${process.env.FRONTEND_URL}/track/${token}`;
        const sent = await sendSosSms(phone, message);
        if (sent) contactsNotified++;
      }
      
      await pool.query('UPDATE sos_events SET contacts_notified = $1 WHERE id = $2', [contactsNotified, sosEventId]);
    }

    // Incident Memory Engine: Log Trigger Action with enhanced telemetry
    await pool.query(
      `INSERT INTO incident_logs (sos_event_id, action_type, description, metadata) VALUES ($1, $2, $3, $4)`,
      [sosEventId, 'TRIGGERED', 'SOS initiated from device.', JSON.stringify({ 
        lat, 
        lng, 
        medicalProfile_provided: !!medicalProfile,
        emotionalState: emotionalState || 'unknown',
        networkCondition: networkCondition || 'unknown',
        hasBlackboxData: blackboxData && blackboxData.length > 0
      })]
    );

    // Swarm Intelligence: Aggregate reports
    const swarmResult = await SwarmIntelligenceEngine.processReport({
      id: sosEventId,
      userId: deviceId,
      lat,
      lng,
      type: 'EMERGENCY',
      timestamp: Date.now(),
      confidence: 0.9
    });

    // Enqueue for Multi-Channel Dispatch (WebSockets, SMS, MESH)
    const payload = {
      type: 'EMERGENCY',
      deviceId,
      lat,
      lng,
      medicalProfile: medicalProfile || null,
      emotionalState,
      token,
      swarmAction: swarmResult.action,
      unifiedIncidentId: swarmResult.incidentId
    };
    await enqueueSos(sosEventId, payload);

    // AI Voice Call Bridge: Trigger if severity is high or critical
    if (swarmResult.action === 'CREATED_NEW') {
      VoiceCallBridge.initiateCall({
        incidentId: sosEventId,
        type: 'EMERGENCY',
        severity: 'CRITICAL',
        location: { lat, lng },
        telemetry: { emotionalState },
        medicalInfo: medicalProfile,
        contactNumber: contactPhones?.[0]
      });
    }

    // Adapter Layer: Broadcast to external partners (Twilio, Gov, etc.)
    adapterManager.broadcastSOS({
      incidentId: sosEventId,
      type: 'EMERGENCY',
      severity: 'CRITICAL',
      location: { lat, lng },
      telemetry: { emotionalState },
      medicalInfo: medicalProfile
    });

    res.json({ token, message: 'SOS Triggered successfully', contactsNotified, eventId: sosEventId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to trigger SOS' });
  }
});

// Update Location
router.post('/location-update', async (req, res) => {
  const { token, lat, lng } = req.body;
  
  if (!token || !lat || !lng) {
    return res.status(400).json({ error: 'Missing token or coordinates' });
  }

  try {
    // Check if token is valid and active in DB (cached check could be added)
    const { rows } = await pool.query('SELECT id FROM sos_events WHERE tracking_token = $1 AND is_active = true', [token]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or inactive tracking token' });
    }

    // Update in redis for fast retrieval
    if (redisClient.isOpen) {
      await redisClient.set(`location_${token}`, JSON.stringify({ lat, lng }), { EX: 3600 });
    }

    // Broadcast update
    broadcastLocationUpdate(token, lat, lng);
    
    // Periodically update DB here if needed, omitted for brevity

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get tracking info
router.get('/track/:token', async (req, res) => {
  const { token } = req.params;
  
  try {
    // Check cache first
    if (redisClient.isOpen) {
      const cached = await redisClient.get(`location_${token}`);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    // Fallback to DB
    const { rows } = await pool.query(
      'SELECT ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM sos_events WHERE tracking_token = $1 AND is_active = true', 
      [token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tracking session not found or expired' });
    }

    res.json({ lat: rows[0].lat, lng: rows[0].lng });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

export default router;
