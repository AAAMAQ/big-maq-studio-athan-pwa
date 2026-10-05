/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
*/

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,json,ico,png,svg}'],
        runtimeCaching: [
          // pages & assets
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages' }
          },
          {
            urlPattern: ({ sameOrigin }) => sameOrigin,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets' }
          },
          // Quran API caching (offline after first fetch)
          {
            urlPattern: ({ url }) => url.origin.includes('api.alquran.cloud'),
            handler: 'NetworkFirst',
            options: { cacheName: 'quran-api', networkTimeoutSeconds: 3 }
          }
        ]
      },
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png',
        'icons/maskable-icon-192x192.png',
        'icons/maskable-icon-512x512.png'
      ],
      manifest: {
        name: 'Athan PWA',
        short_name: 'Athan',
        description: 'A lightweight, privacy-first Islamic utility for prayer times, Qibla, Quran, and Salah tracking.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#071824',
        theme_color: '#0d9488',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  // If you deploy under a subpath (GitHub Pages), set:
  // base: '/athan-pwa/'
})
