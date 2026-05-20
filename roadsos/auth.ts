import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import { createAdminClient } from '@/lib/supabase/client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret',
    }),
    Apple({
      clientId: process.env.APPLE_ID || 'mock-apple-client-id',
      clientSecret: process.env.APPLE_SECRET || 'mock-apple-client-secret',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.id) return true;
      const adminDb = createAdminClient();
      if (!adminDb) {
        console.warn('[NextAuth] Supabase admin client not configured during signIn callback');
        return true;
      }
      try {
        const { error } = await adminDb
          .from('users')
          .upsert({
            id: user.id,
            full_name: user.name || 'User',
            email: user.email || null,
            profile_photo_url: user.image || null,
            provider: account?.provider || 'oauth',
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('[NextAuth] Error upserting user in signIn callback:', error.message);
        }
      } catch (err) {
        console.error('[NextAuth] Exception in signIn callback:', err);
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || (token.id as string);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev-only-change-this-in-production-12345678',
});
