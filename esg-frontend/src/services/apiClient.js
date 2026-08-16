// ============================================================================
// Axios instance terpusat. Semua service lain (schoolService, authService,
// esgService) memakai instance ini untuk memanggil backend sungguhan.
// Base URL default = relative "/api" (di-proxy oleh Vite di dev dan oleh
// netlify.toml di produksi Netlify). Override via VITE_API_BASE_URL.
// ============================================================================
import axios from 'axios'
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants.js'

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/api',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`
  }
  return requestConfig
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    }
    return Promise.reject(error)
  }
)

export default apiClient
