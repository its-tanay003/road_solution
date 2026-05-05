import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PushNotificationState {
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  responderId: string | null;
  setSubscribed: (subscribed: boolean, sub?: PushSubscription | null) => void;
  setResponderId: (id: string) => void;
}

export const usePushNotificationStore = create<PushNotificationState>()(
  persist(
    (set) => ({
      isSubscribed: false,
      subscription: null,
      responderId: null,
      setSubscribed: (subscribed, sub = null) => set({ isSubscribed: subscribed, subscription: sub }),
      setResponderId: (id) => set({ responderId: id }),
    }),
    {
      name: 'roadsos-push-storage',
    }
  )
);
