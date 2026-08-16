// ============================================================================
// Layer data untuk halaman PUBLIK & data baca (read) sekolah.
// Setiap fungsi punya dua jalur:
//   - USE_MOCK true  -> baca dari /src/mock (data dummy, ada delay simulasi)
//   - USE_MOCK false -> panggil endpoint backend asli lewat apiClient (axios)
// Ganti isi cabang "else" jika path endpoint asli backend berbeda.
// ============================================================================
import apiClient from './apiClient.js'
import { USE_MOCK } from '../config.js'
import { delay } from '../utils/helpers.js'
import { mockSchools } from '../mock/schools.js'
import { mockScoreHistory, mockRecommendations } from '../mock/esgData.js'
import { normalizeSchool, normalizeHistory, normalizeRecommendations } from './normalize.js'

// GET /schools?q=...  -> daftar sekolah (untuk pencarian di halaman publik)
export async function getSchools(query = '') {
  if (USE_MOCK) {
    await delay(400)
    const q = query.trim().toLowerCase()
    if (!q) return mockSchools
    return mockSchools.filter(
      (s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    )
  }
  const { data } = await apiClient.get('/schools', { params: { q: query } })
  return (Array.isArray(data) ? data : []).map(normalizeSchool)
}

// GET /schools/:id -> profil dasar 1 sekolah (skor E/S/G, akreditasi, alamat, dst.)
export async function getSchoolById(id) {
  if (USE_MOCK) {
    await delay(400)
    return mockSchools.find((s) => s.id === id) || null
  }
  const { data } = await apiClient.get(`/schools/${id}`)
  return normalizeSchool(data)
}

// GET /schools/:id/history -> riwayat skor tahunan (untuk grafik progres)
// (Backend tidak punya endpoint terpisah; diambil dari detail /schools/:id)
export async function getSchoolHistory(id) {
  if (USE_MOCK) {
    await delay(350)
    return mockScoreHistory[id] || []
  }
  const { data } = await apiClient.get(`/schools/${id}`)
  return normalizeHistory(data)
}

// GET /schools/:id/recommendations -> teks saran otomatis per aspek E/S/G
// (Backend tidak punya endpoint terpisah; diambil dari detail /schools/:id)
export async function getSchoolRecommendations(id) {
  if (USE_MOCK) {
    await delay(500)
    return mockRecommendations[id] || null
  }
  const { data } = await apiClient.get(`/schools/${id}`)
  return normalizeRecommendations(data)
}
