import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    global: {},          // 👈 ye add karo
    // "process.env": {}, // future ke liye, optional
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
