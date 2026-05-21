import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import Credentials from 'next-auth/providers/credentials';
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
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: generateUUID(credentials.email as string),
          name: 'Developer User',
          email: credentials.email as string,
          image: 'https://ui-avatars.com/api/?name=Developer+User&background=random',
        };
      },
    }),
  ],
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
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev-only-change-this-in-production-12345678',
});
