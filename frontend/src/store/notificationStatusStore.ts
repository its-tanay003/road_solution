import { create } from 'zustand';

export type NotificationChannel = 'WHATSAPP' | 'PUSH' | 'NEARBY' | 'SMS' | 'INDIA_112' | 'MESH';
export type DeliveryStatus = 'IDLE' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CONNECTED' | 'DISCONNECTED';

interface ChannelStatus {
  status: DeliveryStatus;
  message?: string;
  timestamp?: number;
}

interface NotificationStatusState {
  channels: Record<NotificationChannel, ChannelStatus>;
  updateStatus: (channel: NotificationChannel, status: DeliveryStatus, message?: string) => void;
  resetAll: () => void;
}

const initialChannels: Record<NotificationChannel, ChannelStatus> = {
  WHATSAPP: { status: 'IDLE' },
  PUSH: { status: 'IDLE' },
  NEARBY: { status: 'IDLE' },
  SMS: { status: 'IDLE' },
  INDIA_112: { status: 'IDLE' },
  MESH: { status: 'IDLE' },
};

export const useNotificationStatusStore = create<NotificationStatusState>((set) => ({
  channels: initialChannels,
  updateStatus: (channel, status, message) => set((state) => ({
    channels: {
      ...state.channels,
      [channel]: { status, message, timestamp: Date.now() }
    }
  })),
  resetAll: () => set({ channels: initialChannels })
}));
