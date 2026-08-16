import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// '/api' dipakai sebagai base URL relative (lihat src/config.js).
// Di dev, proxy ke backend lokal; di produksi Netlify, netlify.toml
// yang me-proxy /api ke URL backend publik.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})