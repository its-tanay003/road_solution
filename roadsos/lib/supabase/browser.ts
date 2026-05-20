import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let _client: SupabaseClient | null = null;

/**
 * Returns the Supabase browser client, or null if env vars are not configured.
 * Lazy-initialized to avoid throwing during SSR / static build.
 */
export function getBrowserClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!_client) _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

// Convenience re-export for files that always run in browser context.
// Will be null at build-time if env vars are absent — callers must guard.
export const supabase = getBrowserClient();
