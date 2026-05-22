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

  // Admin Role Checks
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/control-room');
  if (isAdminPath) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
    const userEmail = session.user.email?.toLowerCase();
    const isAdmin = userEmail && adminEmails.includes(userEmail);
    if (!isAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

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
  ],
};
