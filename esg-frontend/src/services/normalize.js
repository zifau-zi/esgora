// ============================================================================
// Normalisasi respons backend → bentuk data yang dipakai komponen frontend.
// Backend `GET /schools/:id` mengembalikan:
//   { id, name, npsn, address, overallScore, environmentalScore, socialScore,
//     governanceScore, predicate, history: [{year, E, S, G, Total}],
//     recommendations: [{category, title, text, priority}] }
// Frontend komponen memakai:
//   school: { id, name, level, address, city, province, accreditation, npsn,
//             overallScore, scores: {environmental, social, governance},
//             lastUpdated, recommendations: {environmental, social, governance, summary} }
//   history: [{ year, environmental, social, governance, overall }]
// ============================================================================

const num = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? 0 : Number(v))

export function parseLevel(name = '') {
  const m = String(name).toUpperCase().match(/\b(SD|SMP|SMA|SMK)\b/)
  return m ? m[1] : 'Sekolah'
}

// Address contoh: "Jl. Pendidikan 1, Jakarta" → { city: 'Jakarta', province: '' }
export function parseAddressParts(address = '') {
  const parts = String(address)
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  const city = parts.length > 1 ? parts[parts.length - 1] : parts[0] || ''
  return { city, province: '' }
}

const summaryFor = (school) => {
  const overall = num(school.overallScore)
  const label =
    overall >= 85
      ? 'sangat baik'
      : overall >= 70
      ? 'baik'
      : overall >= 55
      ? 'cukup'
      : 'perlu banyak perbaikan'
  return `Secara keseluruhan, sekolah ini memperoleh skor ESG sebesar ${overall} dari 100 yang tergolong ${label}. Skor ini merupakan gabungan dari tiga aspek utama: Lingkungan (${num(school.environmentalScore)}), Sosial (${num(school.socialScore)}), dan Tata Kelola (${num(school.governanceScore)}). Rekomendasi berikut dihasilkan otomatis oleh sistem berdasarkan data yang telah dikirim.`
}

// detail.recommendations: [{ category: 'E'|'S'|'G', title, text, priority }]
export function normalizeRecommendations(detail = {}) {
  const list = Array.isArray(detail.recommendations) ? detail.recommendations : []
  const byCategory = (c) => list.find((r) => r.category === c)
  const E = byCategory('E')
  const S = byCategory('S')
  const G = byCategory('G')
  return {
    environmental: E?.text || 'Belum ada rekomendasi untuk aspek Lingkungan.',
    social: S?.text || 'Belum ada rekomendasi untuk aspek Sosial.',
    governance: G?.text || 'Belum ada rekomendasi untuk aspek Tata Kelola.',
    summary: summaryFor(detail),
  }
}

// Detail backend (dan hasil pencarian yang sudah diperkaya skor pilar).
export function normalizeSchool(raw = {}) {
  const loc = parseAddressParts(raw.address)
  const env = num(raw.environmentalScore)
  const soc = num(raw.socialScore)
  const gov = num(raw.governanceScore)
  const latestHistory = Array.isArray(raw.history) ? raw.history[raw.history.length - 1] : null
  const fallbackDate = latestHistory ? `${latestHistory.year}-01-01` : null

  return {
    id: raw.id,
    name: raw.name || '',
    npsn: raw.npsn || '',
    level: parseLevel(raw.name),
    address: raw.address || '',
    city: loc.city,
    province: loc.province,
    accreditation: raw.predicate || 'Belum Terakreditasi',
    overallScore: num(raw.overallScore),
    scores: { environmental: env, social: soc, governance: gov },
    lastUpdated: raw.lastUpdated || raw.updatedAt || fallbackDate,
    publishedAt: raw.publishedAt || raw.createdAt || raw.lastUpdated || fallbackDate,
    recommendations: normalizeRecommendations(raw),
  }
}

export function normalizeHistory(detail = {}) {
  if (!Array.isArray(detail.history)) return []
  return detail.history.map((h) => ({
    year: h.year,
    environmental: num(h.E),
    social: num(h.S),
    governance: num(h.G),
    overall: num(h.Total),
  }))
}
