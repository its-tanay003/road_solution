import express from 'express';
import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const publicVapidKey = process.env.VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';

webpush.setVapidDetails(
  'mailto:alerts@roadsos.in',
  publicVapidKey,
  privateVapidKey
);

// In-memory subscription storage (keyed by responderId)
const subscriptions: Record<string, webpush.PushSubscription> = {};

// POST /api/push/subscribe
router.post('/subscribe', (req, res) => {
  const { subscription, responderId } = req.body;
  if (!subscription || !responderId) {
    return res.status(400).json({ error: 'Subscription and responderId are required' });
  }
  
  subscriptions[responderId] = subscription;
  res.status(201).json({ message: 'Subscription saved successfully' });
});

// POST /api/push/send-alert
router.post('/send-alert', (req, res) => {
  const { incidentId, road, distance, severity } = req.body;
  
  const payload = JSON.stringify({
    title: `🚨 ROADSoS ALERT — Crash nearby`,
    body: `Incident on ${road || 'nearby road'}, ${distance || 'unknown'}km from you. Tap to respond.`,
    icon: '/icons/roadsos-192.png',
    badge: '/icons/badge.png',
    data: {
      incidentId,
      responderUrl: `/responder/${incidentId}`
    }
  });

  const pushPromises = Object.values(subscriptions).map(subscription => {
    return webpush.sendNotification(subscription, payload).catch(err => {
      console.error('Error sending notification:', err);
      // Prune failed subscriptions if they are no longer valid
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Find and remove the subscription (simplified for this demo)
      }
    });
  });

  Promise.all(pushPromises)
    .then(() => res.status(200).json({ message: 'Notifications sent' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

export default router;
