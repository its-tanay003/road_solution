import { pool } from '../db/connection';
import { broadcastToResponders } from './socketService';
import { ResponderService } from './responderService';

// Simple Circuit Breaker State
const circuitBreaker = {
  sms: { failures: 0, state: 'CLOSED', nextRetryAt: 0 },
  mesh: { failures: 0, state: 'CLOSED', nextRetryAt: 0 }
};

const MAX_FAILURES = 3;
const CIRCUIT_OPEN_DURATION = 30000; // 30s

const executeWithCircuitBreaker = async (channel: 'sms' | 'mesh', operation: () => Promise<boolean>): Promise<boolean> => {
  const cb = circuitBreaker[channel];
  
  if (cb.state === 'OPEN') {
    if (Date.now() > cb.nextRetryAt) {
      cb.state = 'HALF_OPEN';
    } else {
      return false; // Fast fail
    }
  }

  const success = await operation();

  if (success) {
    cb.failures = 0;
    cb.state = 'CLOSED';
    return true;
  } else {
    cb.failures++;
    if (cb.failures >= MAX_FAILURES) {
      cb.state = 'OPEN';
      cb.nextRetryAt = Date.now() + CIRCUIT_OPEN_DURATION;
      console.warn(`[CIRCUIT BREAKER] ${channel.toUpperCase()} is OPEN. Fast failing subsequent calls.`);
    }
    return false;
  }
};

export const enqueueSos = async (sosEventId: string, payload: any) => {
  try {
    const client = await pool.connect();
    
    // Attempt Primary Channel: WebSockets / Live Command Center
    const internetStatus = broadcastToResponders('sos_alert', payload) ? 'DELIVERED' : 'PENDING';
    
    // Community Responder Dispatch
    // Find volunteers within radius (Severity can be dynamically extracted, assuming MODERATE for fallback)
    const severity = payload.severity || 'MODERATE';
    const responders = await ResponderService.findResponders(payload.lat, payload.lng, severity);
    const volunteers = responders.filter(r => r.type === 'volunteer' && r.distance < 5000); // within 5km

    if (volunteers.length > 0) {
      // Simulate targeted push notification or targeted websocket event
      broadcastToResponders('community-alert', {
        ...payload,
        volunteersAlerted: volunteers.length
      });
      console.log(`Dispatched community-alert to ${volunteers.length} nearby volunteers.`);
    }
    
    await client.query(
      `INSERT INTO sos_dispatch_queue (sos_event_id, channel, status, payload) VALUES ($1, $2, $3, $4)`,
      [sosEventId, 'INTERNET', internetStatus, payload]
    );

    // Simulate SMS Fallback Queue
    await client.query(
      `INSERT INTO sos_dispatch_queue (sos_event_id, channel, status, payload) VALUES ($1, $2, $3, $4)`,
      [sosEventId, 'SMS', 'PENDING', payload]
    );

    // Simulate Mesh Fallback Queue
    await client.query(
      `INSERT INTO sos_dispatch_queue (sos_event_id, channel, status, payload) VALUES ($1, $2, $3, $4)`,
      [sosEventId, 'MESH', 'PENDING', payload]
    );

    client.release();
    console.log(`SOS ${sosEventId} enqueued for multi-channel dispatch.`);
  } catch (error) {
    console.error('Error enqueuing SOS:', error);
  }
};

// Background worker simulator to process queue
setInterval(async () => {
  try {
    const client = await pool.connect();
    const { rows } = await client.query(
      `SELECT * FROM sos_dispatch_queue WHERE status = 'PENDING' AND next_retry_at <= NOW()`
    );

    for (const job of rows) {
      console.log(`Processing queue job ${job.id} via ${job.channel}...`);
      
      let success = false;
      if (job.channel === 'SMS') {
        success = await executeWithCircuitBreaker('sms', async () => Math.random() > 0.2); // 80% success
      } else if (job.channel === 'MESH') {
        success = await executeWithCircuitBreaker('mesh', async () => Math.random() > 0.5); // 50% success
      } else {
        success = broadcastToResponders('sos_alert', job.payload);
      }

      if (success) {
        // Randomly simulate ACKs vs just DELIVERED
        const finalStatus = Math.random() > 0.3 ? 'ACKNOWLEDGED' : 'DELIVERED';
        await client.query(`UPDATE sos_dispatch_queue SET status = $1 WHERE id = $2`, [finalStatus, job.id]);
        
        // Push status update to frontend via WebSocket
        broadcastToResponders('sos_status_update', {
          sosEventId: job.sos_event_id,
          channel: job.channel,
          status: finalStatus
        });
      } else {
        const nextRetry = new Date(Date.now() + 5000 * Math.pow(2, job.retry_count)); // Exponential backoff
        if (job.retry_count >= 5) {
          // Dead letter after 5 retries
          await client.query(`UPDATE sos_dispatch_queue SET status = 'FAILED' WHERE id = $1`, [job.id]);
          broadcastToResponders('sos_status_update', {
            sosEventId: job.sos_event_id,
            channel: job.channel,
            status: 'FAILED'
          });
        } else {
          await client.query(
            `UPDATE sos_dispatch_queue SET retry_count = retry_count + 1, next_retry_at = $1 WHERE id = $2`,
            [nextRetry, job.id]
          );
        }
      }
    }
    client.release();
  } catch (error) {
    // Silently handle if DB is not connected yet during dev
  }
}, 10000); // Check every 10s
