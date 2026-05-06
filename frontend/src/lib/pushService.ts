import { logger } from './logger';
/**
 * Web Push API Service for ROADSoS
 * Handles local browser notifications for the PWA.
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    logger.error('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendLocalPush = (title: string, options: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icons/icon-192x192.png', // Fallback icon path
      badge: '/icons/icon-72x72.png',
      ...options
    });
  }
};

/**
 * Haversine formula to calculate distance between two points in km
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const notifyNearbyResponders = async (
  incidentLocation: { lat: number, lng: number },
  incidentRoad: string,
  responders: any[]
) => {
  const permission = await requestNotificationPermission();
  if (!permission) return;

  responders.forEach(responder => {
    const dist = calculateDistance(
      incidentLocation.lat,
      incidentLocation.lng,
      responder.location.lat,
      responder.location.lng
    );

    if (dist <= 5) {
      sendLocalPush('ROADSOS ALERT', {
        body: `Crash on ${incidentRoad}, ${dist.toFixed(1)}km from your location. Tap to respond.`,
        tag: 'incident-alert',
        data: { url: '/war-room' }
      });
      logger.log(`PWA Push sent to ${responder.unitId} (${dist.toFixed(1)}km away)`);
    }
  });
};
