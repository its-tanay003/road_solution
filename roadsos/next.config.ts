import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  // @ts-ignore
  allowedDevOrigins: ['192.168.137.1'],
  serverExternalPackages: ['@anthropic-ai/sdk', '@google/generative-ai', 'openai'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.137.1:3000'],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'upload.wikimedia.org',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
