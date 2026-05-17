import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      overlay: true,
    },
    watch: {
      usePolling: false,
    },
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
    dedupe: [
      'react',
      'react-dom', 
      'react-router-dom',
      'framer-motion',
      '@react-three/fiber',
      '@react-three/drei',
      'three',
    ],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: false,
  },
  build: {
    chunkSizeWarningLimit: 600,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const normalizedPath = id.replace(/\\/g, '/');
            const parts = normalizedPath.split('node_modules/');
            const pathAfterNodeModules = parts[parts.length - 1];
            
            let pkgName = '';
            if (pathAfterNodeModules.startsWith('@')) {
              const segments = pathAfterNodeModules.split('/');
              if (segments.length >= 2) {
                pkgName = `${segments[0]}/${segments[1]}`;
              }
            } else {
              pkgName = pathAfterNodeModules.split('/')[0];
            }

            if (
              pkgName === 'react' ||
              pkgName === 'react-dom' ||
              pkgName === 'react-router-dom' ||
              pkgName === 'react-router' ||
              pkgName === '@remix-run/router' ||
              pkgName === 'scheduler' ||
              pkgName === 'react-is'
            ) {
              return 'react-vendor';
            }
            if (pkgName === 'framer-motion') {
              return 'animation';
            }
            if (pkgName === 'leaflet' || pkgName === 'react-leaflet') {
              return 'map';
            }
            if (pkgName === 'three') {
              return 'three';
            }
            if (pkgName.startsWith('@react-three/')) {
              return 'react-three';
            }
            if (pkgName === 'chart.js' || pkgName === 'react-chartjs-2') {
              return 'charts';
            }
            if (pkgName === 'jspdf' || pkgName === 'jspdf-autotable' || pkgName === 'html2canvas') {
              return 'pdf';
            }
            if (pkgName === 'i18next' || pkgName === 'react-i18next') {
              return 'i18n';
            }
            if (pkgName === 'lucide-react' || pkgName === 'clsx' || pkgName === 'tailwind-merge') {
              return 'ui-utils';
            }
          }
        }
      }
    }
  },

});
