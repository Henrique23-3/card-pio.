import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    injectRegister: false,

    manifest: {
      name: 'Brasil de Muitos Sabores',
      short_name: 'Muitos Sabores',
      description: 'Comidas típicas das cinco regiões do Brasil',
      theme_color: '#701426',
      background_color: '#fff9ee',
      lang: 'pt-BR',
      start_url: '/',
      display: 'standalone',

      icons: [{
        src: 'pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png',
      }, {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      }, {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      }, {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }],
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      runtimeCaching: [{
        urlPattern: ({ url }) => url.pathname.startsWith('/storage/v1/object/public/dish-photos/'),
        handler: 'CacheFirst',
        options: { cacheName: 'dish-photos', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } },
      }],
      clientsClaim: true,
    },
  })],
})