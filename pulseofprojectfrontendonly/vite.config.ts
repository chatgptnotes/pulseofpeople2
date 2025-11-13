import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 8080,
    host: true,
    allowedHosts: [
      '.railway.app',  // Allow all Railway domains
      'pulseofpeople-frontend-production.up.railway.app',
      'pulseofpeople.com',
      'tvk.pulseofpeople.com',
      'www.pulseofpeople.com',
      'localhost',
      '127.0.0.1'
    ]
  }
})