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
  language?: 'en' | 'hi' | 'ta';
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  status: 'Accepted' | 'Pending';
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  googleConnected: boolean;
  instagramConnected: boolean;
  instagramHandle?: string;
  facebookConnected: boolean;
  whatsappNumber?: string;
  trustedContacts: Contact[];
  
  setSession: (session: Session | null) => void;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  connectSocial: (provider: 'google' | 'instagram' | 'facebook', handle?: string) => void;
  setWhatsapp: (phone: string) => void;
  addContact: (contact: Omit<Contact, 'id' | 'status'>) => void;
  removeContact: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      googleConnected: false,
      instagramConnected: false,
      facebookConnected: false,
      trustedContacts: [],

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
            } as unknown as Session['user']
          } as Session
        });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
      },

      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),

      connectSocial: (provider, handle) => set(() => ({
        [`${provider}Connected`]: true,
        ...(provider === 'instagram' ? { instagramHandle: handle } : {})
      })),

      setWhatsapp: (whatsappNumber) => set({ whatsappNumber }),

      addContact: (contact) => set((state) => ({
        trustedContacts: [
          ...state.trustedContacts,
          { ...contact, id: Math.random().toString(36).substr(2, 9), status: 'Pending' }
        ]
      })),

      removeContact: (id) => set((state) => ({
        trustedContacts: state.trustedContacts.filter(c => c.id !== id)
      })),
    }),
    {
      name: 'roadsos-auth',
      partialize: (s) => ({ 
        user: s.user, 
        session: s.session, 
        isAuthenticated: s.isAuthenticated,
        googleConnected: s.googleConnected,
        instagramConnected: s.instagramConnected,
        instagramHandle: s.instagramHandle,
        facebookConnected: s.facebookConnected,
        whatsappNumber: s.whatsappNumber,
        trustedContacts: s.trustedContacts
      }),
    }
  )
);

// Initialize auth listener
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
