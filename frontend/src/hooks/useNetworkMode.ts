import { useState, useEffect } from 'react';

export const useNetworkMode = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection speed if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const updateConnectionStatus = () => {
        setIsLowBandwidth(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.saveData);
      };
      
      updateConnectionStatus();
      connection.addEventListener('change', updateConnectionStatus);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateConnectionStatus);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline, isLowBandwidth };
};
