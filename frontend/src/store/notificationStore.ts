import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface NotificationAction {
  id: string;
  label: string;
  link: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  archived: boolean;
  incidentId?: string;
  actions?: NotificationAction[];
  priorityScore: number;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  isSuppressed: boolean; // DND mode
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'archived' | 'priorityScore'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  exportLogs: () => void;
  toggleDND: () => void;
  setSuppression: (suppressed: boolean) => void;
  getFilteredNotifications: (filter: { type?: NotificationType | 'ALL'; search?: string }) => Notification[];
}

// Simple heuristic for priority scoring
const calculatePriority = (type: NotificationType, timestamp: number): number => {
  const baseScore = {
    CRITICAL: 100,
    HIGH: 70,
    MEDIUM: 40,
    LOW: 10
  }[type];

  // Decay score over time (e.g., -1 point per minute since timestamp)
  const ageInMinutes = Math.floor((Date.now() - timestamp) / 60000);
  return Math.max(0, baseScore - ageInMinutes);
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          type: 'CRITICAL',
          title: 'NEW SOS TRIGGERED',
          message: 'Multiple trauma detected at NH-44. Unit A-12 dispatched.',
          timestamp: Date.now() - 1000 * 60 * 5,
          read: false,
          archived: false,
          priorityScore: 95,
          incidentId: 'INC-4421'
        },
        {
          id: '2',
          type: 'HIGH',
          title: 'AI TRIAGE COMPLETE',
          message: 'Case #4421 analyzed. High probability of spinal injury.',
          timestamp: Date.now() - 1000 * 60 * 15,
          read: false,
          archived: false,
          priorityScore: 75,
          incidentId: 'INC-4421'
        }
      ],
      isSuppressed: false,

      addNotification: (n) => {
        const timestamp = Date.now();
        const id = Math.random().toString(36).substring(2, 9);
        const priorityScore = calculatePriority(n.type, timestamp);

        // Suppression logic
        if (get().isSuppressed && n.type !== 'CRITICAL') return;

        const newNotification: Notification = {
          ...n,
          id,
          timestamp,
          read: false,
          archived: false,
          priorityScore
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications]
        }));

        // Trigger audio (implemented in component)
      },

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      archiveNotification: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, archived: true } : n)
      })),

      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      clearAll: () => set({ notifications: [] }),

      exportLogs: () => {
        const data = JSON.stringify(get().notifications, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roadsos-notifications-${new Date().toISOString()}.json`;
        a.click();
      },

      toggleDND: () => set((state) => ({ isSuppressed: !state.isSuppressed })),

      setSuppression: (suppressed) => set({ isSuppressed: suppressed }),

      getFilteredNotifications: (filter) => {
        const { type, search } = filter;
        return get().notifications
          .filter(n => !n.archived)
          .filter(n => type === 'ALL' || !type || n.type === type)
          .filter(n => !search || 
            n.title.toLowerCase().includes(search.toLowerCase()) || 
            n.message.toLowerCase().includes(search.toLowerCase()) ||
            n.incidentId?.toLowerCase().includes(search.toLowerCase())
          )
          .sort((a, b) => b.priorityScore - a.priorityScore || b.timestamp - a.timestamp);
      }
    }),
    {
      name: 'roadsos-notifications'
    }
  )
);
