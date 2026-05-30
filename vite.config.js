import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Intercepts local frontend requests to /api and forwards them to your local server
      '/api': {
        target: 'http://localhost:3001', // Your local backend port
        changeOrigin: true,
        secure: false,
      }
    }
  }
});