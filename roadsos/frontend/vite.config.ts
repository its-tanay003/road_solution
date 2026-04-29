import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4,webm,mp3,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.roadsos\.local\/api\/services/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-services-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cartodb-basemaps-[a-d]\.global\.ssl\.fastly\.net/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
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
})
