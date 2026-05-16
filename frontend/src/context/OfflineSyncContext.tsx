import { createContext, useContext } from 'react';

export interface OfflineSyncContextType {
  isCaching: boolean;
  progress: number;
  total: number;
  isReady: boolean;
}

export const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) throw new Error('useOfflineSync must be used within OfflineSyncProvider');
  return context;
};
