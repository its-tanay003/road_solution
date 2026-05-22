import type { NextConfig } from "next";
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
} as any);

const nextConfig: NextConfig = {
  outputFileTracingRoot: require('path').resolve(__dirname, '..'),
  allowedDevOrigins: ['192.168.137.1'],
  serverExternalPackages: ['@anthropic-ai/sdk', '@google/generative-ai', 'openai'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.137.1:3000'],
    },
  },
  typescript: {
    // Do NOT ignore build errors — fix them properly
    ignoreBuildErrors: false,
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
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default withPWA(nextConfig);
