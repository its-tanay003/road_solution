import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import { createAdminClient } from '@/lib/supabase/client';

function generateUUID(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}-0000-4000-a000-000000000000`;
}

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(Apple({
    clientId: process.env.APPLE_ID,
    clientSecret: process.env.APPLE_SECRET,
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.id) return true;
      const uuid = generateUUID(user.email || user.id);
      user.id = uuid;
      
      const adminDb = createAdminClient();
      if (!adminDb) {
        console.warn('[NextAuth] Supabase admin client not configured during signIn callback');
        return true;
      }
      try {
        const { error } = await adminDb
          .from('profiles')
          .upsert({
            id: user.id,
            name: user.name || 'User',
            email: user.email || null,
            avatar_url: user.image || null,
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
        session.user.id = (token.id as string) || (token.sub as string);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});
