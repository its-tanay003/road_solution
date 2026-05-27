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

export default auth(async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  console.log(`[Middleware Entry] Path: ${pathname}, SearchParams: ${searchParams.toString()}`);

  // Protect against open redirects / deep-link attacks
  let hasUnsafe = false;
  const newParams = new URLSearchParams(searchParams);
  const unsafeKeys = ['redirect', 'next', 'callbackUrl', 'url'];
  
  for (const key of unsafeKeys) {
    if (newParams.has(key)) {
      const val = newParams.get(key);
      if (val) {
        // Unsafe if it starts with // or has :// or javascript: unless it is local
        const isLocal = val.startsWith('/') && !val.startsWith('//');
        const isAllowedDomain = val.includes('localhost') || val.includes('127.0.0.1');
        const hasProtocol = val.includes('://') || val.startsWith('//') || val.toLowerCase().includes('javascript:');
        
        if ((hasProtocol || !isLocal) && !isAllowedDomain) {
          newParams.delete(key);
          hasUnsafe = true;
        }
      }
    }
  }

  if (hasUnsafe) {
    const cleanUrl = new URL(pathname, request.url);
    cleanUrl.search = newParams.toString();
    return NextResponse.redirect(cleanUrl);
  }

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some((p) => p === '/' ? pathname === '/' : pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check session via request.auth
  const session = request.auth;
  console.log(`[Middleware Proxy] Path: ${pathname}, Session:`, JSON.stringify(session));

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
    '/',
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
