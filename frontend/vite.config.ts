import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
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
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      }
    }
  },
  resolve: {
    alias: [
      { find: /^leaflet$/, replacement: path.resolve(__dirname, 'src/lib/leaflet-esm.ts') },
    ],
  },
  optimizeDeps: {
    include: ['react-is', 'leaflet'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-map';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('zustand')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
