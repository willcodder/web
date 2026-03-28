import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-180.png'],
      manifest: {
        name: 'Facturación Audiovisual',
        short_name: 'Facturas',
        description: 'Gestión de facturación para productoras audiovisuales',
        theme_color: '#007AFF',
        background_color: '#F2F2F7',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/web/',
        start_url: '/web/',
        icons: [
          {
            src: '/web/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/web/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/willcodder\.github\.io\/web\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  base: '/web/',
})
