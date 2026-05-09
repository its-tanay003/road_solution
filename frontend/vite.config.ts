import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: true,

  },
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4,webm,mp3,woff2}'],
      },
      manifest: {
        name: 'ROADSoS Emergency',
        short_name: 'ROADSoS',
        description: 'AI-powered road accident emergency response platform',
        theme_color: '#D72638',
        background_color: '#1A1A2E',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-192x192.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ],
        shortcuts: [
          {
            name: "SOS",
            short_name: "SOS",
            description: "Trigger SOS Emergency",
            url: "/?sos=trigger",
            icons: [{ src: "pwa-192x192.svg", sizes: "192x192", type: "image/svg+xml" }]
          }
        ]
      }
    })
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: { 
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'framer-motion', 'leaflet'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'map';
          }
          if (id.includes('framer-motion')) {
            return 'animation';
          }
          if (id.includes('three')) {
            return 'three';
          }
          if (id.includes('recharts')) {
            return 'charts';
          }
        },
      },
    },
  },
});
