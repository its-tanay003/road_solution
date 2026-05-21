'use client';

import { useEffect } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

export function DbHealthCheck() {
  useEffect(() => {
    const checkRequiredTables = async () => {
      const supabase = getBrowserClient();
      const requiredTables = ['profiles', 'emergency_contacts', 'sos_events'];
      const missing: string[] = [];

      for (const table of requiredTables) {
        // Just fetch 1 row to see if the table exists
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error?.code === 'PGRST205' || error?.code === '42P01') {
          missing.push(table);
        }
      }

      if (missing.length > 0) {
        console.error(`[Supabase] Missing tables: ${missing.join(', ')}. Please run your migrations!`);
      }
    };

    checkRequiredTables();
  }, []);

  return null;
}
