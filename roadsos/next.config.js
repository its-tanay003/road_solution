/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
}

module.exports = nextConfig
