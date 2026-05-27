/** @type {import('next').NextConfig} */

// Security headers applied to all responses
const securityHeaders = [
  // Prevent content type sniffing attacks
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent clickjacking attacks (deny framing by others)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Force HTTPS in production
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Enable XSS protection (older browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(self), notifications=(self), accelerometer=(self)',
  },
  // Content Security Policy — allows the app to work while blocking XSS
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://generativelanguage.googleapis.com https://api.openai.com https://api.resend.com https://api.twilio.com wss://localhost:*",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Hide Next.js version from attackers
  poweredByHeader: false,
  // Next.js 15: serverComponentsExternalPackages moved to top-level
  serverExternalPackages: ['@anthropic-ai/sdk', '@google/generative-ai', 'openai'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.137.1:3000'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
