import { NextResponse } from 'next/server';

function maskString(str: string | undefined): string {
  if (!str) return 'undefined';
  if (str.length <= 8) return 'configured (short)';
  return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
}

export async function GET() {
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  const appleId = process.env.APPLE_ID;
  const appleSecret = process.env.APPLE_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const authUrl = process.env.AUTH_URL;

  return NextResponse.json({
    status: 'diagnostic_active',
    environment_checks: {
      AUTH_SECRET_configured: !!authSecret,
      GOOGLE_CLIENT_ID_configured: !!googleClientId,
      GOOGLE_CLIENT_SECRET_configured: !!googleClientSecret,
      APPLE_ID_configured: !!appleId,
      APPLE_SECRET_configured: !!appleSecret,
      SUPABASE_URL_configured: !!supabaseUrl,
      SUPABASE_ANON_KEY_configured: !!supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY_configured: !!supabaseServiceKey,
      NEXTAUTH_URL_configured: !!nextAuthUrl,
      AUTH_URL_configured: !!authUrl,
    },
    masked_values: {
      AUTH_SECRET: maskString(authSecret),
      GOOGLE_CLIENT_ID: maskString(googleClientId),
      GOOGLE_CLIENT_SECRET: maskString(googleClientSecret),
      NEXTAUTH_URL: maskString(nextAuthUrl),
      AUTH_URL: maskString(authUrl),
    },
    recommendations: {
      has_auth_secret: !!authSecret ? "Yes" : "CRITICAL MISSING: Please define AUTH_SECRET in Vercel settings.",
      has_provider: (!!googleClientId && !!googleClientSecret) || (!!appleId && !!appleSecret) 
        ? "Yes (At least one OAuth provider configured)" 
        : "CRITICAL MISSING: NextAuth needs at least one OAuth provider to initialize. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel.",
    },
    node_runtime: process.version,
    env_mode: process.env.NODE_ENV
  });
}
