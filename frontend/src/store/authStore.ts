import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  avatar?: string;
  provider: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,

      setSession: (session) => {
        if (!session) {
          set({ user: null, session: null, isAuthenticated: false });
          return;
        }

        const user: User = {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          provider: session.user.app_metadata?.provider || 'email',
        };

        set({ user, session, isAuthenticated: true });
      },

      login: (token, user) => {
        // This is primarily for the manual login flow/bypass
        // We set the user and a mock session or just mark as authenticated
        set({ 
          user, 
          isAuthenticated: true,
          session: { 
            access_token: token,
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: '',
            user: { 
              id: user.id, 
              aud: 'authenticated', 
              role: 'authenticated', 
              email: user.email,
              phone: user.phone,
              user_metadata: { full_name: user.name },
              app_metadata: { provider: user.provider },
              created_at: new Date().toISOString()
            } as any
          }
        });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
      },
    }),
    {
      name: 'roadsos-auth',
      partialize: (s) => ({ user: s.user, session: s.session, isAuthenticated: s.isAuthenticated }),
    }
  )
);

// Initialize auth listener
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
