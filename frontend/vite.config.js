import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      
      'localhost',
      '192.168.0.92',
      '.local',
    ],
    hmr: {
      // Only set these when running through Docker/Nginx
      ...(process.env.DOCKER_ENV && {
        clientPort: 8443,
        protocol: 'wss',
        host: 'localshot',
      }),
    },
    proxy: {
      '/api': {
        // Use local backend when not in Docker
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})