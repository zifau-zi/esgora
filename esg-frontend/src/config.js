// Konfigurasi global aplikasi.
// USE_MOCK=true -> semua fungsi di /services membaca dari data dummy (/src/mock).
// Default base URL = relative "/api".
//   - Dev: Vite me-proxy /api ke backend lokal (lihat vite.config.js).
//   - Produksi Netlify: netlify.toml me-proxy /api ke URL backend publik.
// Kalau mau override total, set VITE_API_BASE_URL (atau VITE_API_URL) di
// dashboard Netlify -> Environment variables, lalu rebuild.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
