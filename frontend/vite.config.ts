import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '^/api/events/[^/]+/waitlist$': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/events': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/bookings': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/admin/events/': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/admin/events': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/admin/email-outbox': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/users/me/bookings': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/users/me/waitlist': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
