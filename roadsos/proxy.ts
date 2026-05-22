import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/api/auth',
  '/api/nhtsa',
  '/_next',
  '/favicon.ico',
  '/sw.js',
  '/workbox',
  '/public',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some((p) => p === '/' ? pathname === '/' : pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check session
  const session = await auth();
  if (!session?.user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/control-room/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/map/:path*',
    '/chat/:path*',
    '/directory/:path*',
    '/first-aid/:path*',
    '/api/ai/:path*',
    '/api/sos/:path*',
    '/api/profile/:path*',
    '/api/voice/:path*',
  ],
};
