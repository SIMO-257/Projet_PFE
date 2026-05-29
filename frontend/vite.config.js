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
    },
  }
})
