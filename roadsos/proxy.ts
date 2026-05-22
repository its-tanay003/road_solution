import { auth } from '@/auth';
import { isAdminSession } from '@/lib/server/authz';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/api/auth',
  '/api/nhtsa',
  '/manifest.json',
  '/_next',
  '/favicon.ico',
  '/icons',
  '/sw.js',
  '/workbox',
  '/public',
];

export const proxy = auth(async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some((p) => p === '/' ? pathname === '/' : pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check session via request.auth
  const session = request.auth;
  if (!session?.user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin Role Checks
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/control-room') || pathname.startsWith('/api/admin');
  if (isAdminPath) {
    if (!isAdminSession(session)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin/:path*',
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
    '/api/admin/:path*',
  ],
};
