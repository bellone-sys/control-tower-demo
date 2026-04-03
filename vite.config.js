import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/control-tower-demo/',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ['leaflet'],
          pudos: ['./src/data/pudosRoma.json'],
        },
      },
    },
  },
})
