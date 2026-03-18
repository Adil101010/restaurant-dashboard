import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // ✅ ADD — sab IPs pe listen karo
    port: 5173,
    hmr: {
      host: '192.168.0.116', // ✅ ADD — apna WiFi IP
      port: 5173,
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    global: {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          charts: ['recharts'],
          utils: ['axios', 'date-fns', 'react-hot-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
