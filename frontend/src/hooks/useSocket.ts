import { useEffect, useState, useCallback } from 'react';
import { socket } from '../lib/socket';

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  useEffect(() => {
    socket.connect();

    const onConnect = () => { setConnected(true); setError(null); };
    const onDisconnect = () => setConnected(false);
    const onError = (err: Error) => setError(err.message);
    const onReconnectAttempt = (n: number) => setReconnectCount(n);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
      socket.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      // Queue for when reconnected
      socket.once('connect', () => socket.emit(event, data));
    }
  }, []);


  return { socket, connected, error, reconnectCount, emit };
}
