import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // ✅ Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      allowedHosts: [
        'localhost',
        '192.168.0.92',
        '.local',
        'illustration.local',
        'yaw.nishanaweb.cloud',
        'yaw-frontend',
      ],
      proxy: {
        '/api': {
          // If VITE_API_BASE_URL is relative or empty, default to the internal docker network address
          target: (env.VITE_API_BASE_URL && env.VITE_API_BASE_URL.startsWith('http')) ? env.VITE_API_BASE_URL : 'http://yaw-backend:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  }
})