import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || 'mock-google-client-id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'mock-google-client-secret',
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID || 'mock-apple-client-id',
      clientSecret: process.env.AUTH_APPLE_SECRET || 'mock-apple-client-secret',
    }),
  ],
  callbacks: {
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
  secret: process.env.AUTH_SECRET || 'fallback-secret-for-dev-only-change-this-in-production-12345678',
});
