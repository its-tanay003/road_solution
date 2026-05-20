'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getBrowserClient } from './browser';
import type { DBIncident } from './types';

export type RealtimeConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseRealtimeIncidentsOptions {
  statuses?: DBIncident['status'][];
  limit?: number;
}

export function useRealtimeIncidents(options: UseRealtimeIncidentsOptions = {}) {
  const { statuses, limit = 50 } = options;
  const [incidents, setIncidents] = useState<DBIncident[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getBrowserClient>>['channel']> | null>(null);

  const fetchInitial = useCallback(async () => {
    const sb = getBrowserClient();
    if (!sb) {
      setConnectionStatus('disconnected');
      setError('Supabase not configured — add env vars to .env.local');
      return;
    }

    let query = sb.from('incidents').select('*').order('created_at', { ascending: false }).limit(limit);
    if (statuses?.length) query = query.in('status', statuses);

    const { data, error: fetchError } = await query;
    if (fetchError) setError(fetchError.message);
    else setIncidents((data as DBIncident[]) ?? []);
  }, [statuses, limit]);

  useEffect(() => {
    void fetchInitial();

    const sb = getBrowserClient();
    if (!sb) return;

    const channel = sb
      .channel('incidents-room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' }, (payload) => {
        const newInc = payload.new as DBIncident;
        if (!statuses?.length || statuses.includes(newInc.status)) {
          setIncidents((prev) => [newInc, ...prev].slice(0, limit));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'incidents' }, (payload) => {
        const updated = payload.new as DBIncident;
        setIncidents((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
            .filter((i) => !statuses?.length || statuses.includes(i.status))
        );
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnectionStatus('connected');
        else if (status === 'CHANNEL_ERROR') { setConnectionStatus('error'); setError('Realtime channel error'); }
        else if (status === 'CLOSED') setConnectionStatus('disconnected');
      });

    channelRef.current = channel;
    return () => { void sb.removeChannel(channel); };
  }, [fetchInitial, statuses, limit]);

  const updateIncidentStatus = useCallback(async (id: string, status: DBIncident['status']) => {
    const sb = getBrowserClient();
    if (!sb) throw new Error('Supabase not configured');
    const { error: err } = await sb.from('incidents').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) throw new Error(err.message);
  }, []);

  const refresh = useCallback(() => void fetchInitial(), [fetchInitial]);

  return { incidents, connectionStatus, error, updateIncidentStatus, refresh };
}

export function useIncident(id: string | null) {
  const [incident, setIncident] = useState<DBIncident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const sb = getBrowserClient();
    if (!sb) { setLoading(false); return; }

    sb.from('incidents').select('*').eq('id', id).single()
      .then(({ data }) => { setIncident(data as DBIncident | null); setLoading(false); });

    const channel = sb
      .channel(`incident-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'incidents', filter: `id=eq.${id}` }, (payload) => {
        setIncident(payload.new as DBIncident);
      })
      .subscribe();

    return () => { void sb.removeChannel(channel); };
  }, [id]);

  return { incident, loading };
}
