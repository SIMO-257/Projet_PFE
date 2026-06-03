import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy target for API requests.
// - Docker:     http://nginx      (internal Docker network)
// - Local dev:  http://localhost:8000  (php artisan serve)
const PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
      '/storage': {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
      '/broadcasting': {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
    },
    headers: {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self'; script-src 'self' https://js.stripe.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' * data: blob:; font-src 'self' data:; connect-src 'self' http://localhost https://api.stripe.com; frame-src 'self' https://js.stripe.com;",
  },
 
  }
})
