import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['@anthropic-ai/sdk', '@google/generative-ai', 'openai'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
