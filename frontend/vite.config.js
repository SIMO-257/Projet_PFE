import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  base: '/',  // ← ADD THIS
  build: {
    outDir: 'dist',  // ← ADD THIS
    assetsDir: 'assets',  // ← ADD THIS
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
        target: 'http://nginx',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://nginx',
        changeOrigin: true,
      },
    },
  }
})
