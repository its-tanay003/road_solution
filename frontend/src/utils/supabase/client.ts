/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createMockSupabaseClient = () => {
  console.warn(
    "[ROADSoS] CRITICAL: Supabase environment variables are missing (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). " +
    "Returning a safe mock client deep proxy to prevent production crash."
  );

  const mockHandler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'auth') {
        return {
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
          signUp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
          signOut: async () => ({ error: null }),
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null })
              }),
              single: () => Promise.resolve({ data: null, error: null }),
              then: (resolve: any) => resolve({ data: [], error: null })
            }),
            then: (resolve: any) => resolve({ data: [], error: null })
          }),
          insert: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
            then: (resolve: any) => resolve({ data: [], error: null })
          }),
          update: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
            then: (resolve: any) => resolve({ data: [], error: null })
          }),
          delete: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
            then: (resolve: any) => resolve({ data: [], error: null })
          })
        });
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: async () => ({ data: { path: '' }, error: new Error("Supabase not configured") }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        };
      }
      if (prop === 'channel') {
        return () => ({
          on: () => ({
            subscribe: () => ({ unsubscribe: () => {} })
          })
        });
      }

      // Deep proxy fallback for nested objects and functions
      const dummy = () => {};
      return new Proxy(dummy, mockHandler);
    },
    apply(target, thisArg, argumentsList) {
      const promiseObj = Promise.resolve({ data: null, error: null });
      return new Proxy(promiseObj, mockHandler);
    }
  };

  return new Proxy({}, mockHandler);
};

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    return createMockSupabaseClient() as any;
  }
  try {
    return createBrowserClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("[ROADSoS] Failed to initialize Supabase client:", error);
    return createMockSupabaseClient() as any;
  }
};
