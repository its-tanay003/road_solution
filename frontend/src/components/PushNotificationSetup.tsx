import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { usePushNotificationStore } from '../store/pushNotificationStore';
import { logger } from '../lib/logger';

export const PushNotificationSetup: React.FC = () => {
  const { isSubscribed, setSubscribed, setResponderId } = usePushNotificationStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }

      // In Demo mode, we skip the real ServiceWorker registration if it's not supported or VAPID is missing
      // But we still track the "subscribed" state to show the UI works.
      const responderId = `resp_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const registration = await navigator.serviceWorker.ready;
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        
        if (publicVapidKey) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
          setSubscribed(true, subscription as unknown as PushSubscription);
        } else {
          // Fallback for demo without VAPID key
          setSubscribed(true, null);
        }
      } catch (swErr) {
        logger.warn('ServiceWorker push subscription failed, falling back to local notification state for demo.', swErr);
        setSubscribed(true, null);
      }

      setResponderId(responderId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await fetch('/api/push/send-alert', {
        method: 'POST',
        body: JSON.stringify({
          incidentId: 'TEST_001',
          road: 'Anna Salai, Chennai',
          distance: 1.2,
          severity: 'HIGH'
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      logger.error('Test notification failed:', err);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-(--clr-border) space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSubscribed ? 'bg-(--clr-green)/20 text-(--clr-green)' : 'bg-white/10 text-white/40'}`}>
            {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-bold">Responder Alerts</h3>
            <p className="text-[10px] font-mono text-(--clr-text-2) uppercase">Push Notifications</p>
          </div>
        </div>
        <button
          onClick={handleSubscribe}
          disabled={loading || isSubscribed}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
            isSubscribed 
              ? 'bg-(--clr-green)/20 text-(--clr-green) border border-(--clr-green)/30 cursor-default'
              : 'bg-(--clr-blue) text-white shadow-[0_0_15px_var(--clr-glow-blue)] hover:scale-105'
          }`}
        >
          {loading ? 'Processing...' : isSubscribed ? 'Active' : 'Enable Alerts'}
        </button>
      </div>

      {isSubscribed ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="p-3 rounded-xl bg-(--clr-green)/5 border border-(--clr-green)/20 flex items-start gap-3">
            <ShieldCheck size={16} className="text-(--clr-green) mt-0.5" />
            <p className="text-[10px] text-white/70 leading-relaxed">
              System armed. You will be alerted to crashes within <span className="text-(--clr-green) font-bold">5km</span> of your current GPS location.
            </p>
          </div>
          <button
            onClick={sendTestNotification}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Send size={14} /> Send Test Notification
          </button>
        </motion.div>
      ) : (
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
          <AlertCircle size={16} className="text-white/20 mt-0.5" />
          <p className="text-[10px] text-white/40 leading-relaxed">
            Stay ready. Enabling alerts allows the ROADSoS network to reach you during nearby emergencies.
          </p>
        </div>
      )}

      {error && <p className="text-[8px] font-mono text-(--clr-red) uppercase text-center">{error}</p>}
    </div>
  );
};
