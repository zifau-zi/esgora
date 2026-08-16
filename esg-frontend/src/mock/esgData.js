// ============================================================================
// DATA DUMMY (MOCK) — riwayat skor & teks rekomendasi.
// Nantinya digantikan respons asli dari endpoint analisis backend.
// Lihat /src/services/schoolService.js untuk titik integrasinya.
// ============================================================================
import { mockSchools } from './schools.js'

function buildHistory(currentScores, years = [2022, 2023, 2024, 2025, 2026]) {
  const step = { environmental: 3.4, social: 2.8, governance: 3.0 }
  return years.map((year, idx) => {
    const yearsBack = years.length - 1 - idx
    const e = Math.max(30, Math.round(currentScores.environmental - step.environmental * yearsBack))
    const s = Math.max(30, Math.round(currentScores.social - step.social * yearsBack))
    const g = Math.max(30, Math.round(currentScores.governance - step.governance * yearsBack))
    return { year, environmental: e, social: s, governance: g, overall: Math.round((e + s + g) / 3) }
  })
}

const TEMPLATES = {
  environmental: {
    high: 'Sekolah telah menunjukkan komitmen lingkungan yang sangat baik melalui program pengelolaan sampah, efisiensi energi, dan ruang hijau yang konsisten. Pertahankan capaian ini dan dokumentasikan praktik baik secara berkala agar dapat menjadi contoh bagi sekolah lain.',
    mid: 'Sekolah sudah memiliki dasar program lingkungan yang cukup baik, seperti pengelolaan sampah dan edukasi lingkungan. Peningkatan pada efisiensi energi dan perluasan ruang hijau masih diperlukan agar dampaknya semakin optimal.',
    low: 'Program lingkungan di sekolah ini masih perlu mendapat perhatian lebih, terutama pada pengelolaan sampah dan konservasi air. Disarankan menyusun rencana aksi lingkungan yang terstruktur beserta target terukur dalam satu tahun ke depan.',
  },
  social: {
    high: 'Aspek sosial sekolah tergolong sangat baik, tercermin dari program kesejahteraan siswa, inklusivitas, dan kebijakan anti-perundungan yang berjalan efektif. Sekolah dapat mulai berbagi praktik baik ini ke komunitas pendidikan sekitarnya.',
    mid: 'Sekolah telah menjalankan sejumlah program sosial seperti bantuan siswa dan pelatihan guru, namun cakupan dan konsistensinya masih dapat diperluas, khususnya dukungan bagi siswa berkebutuhan khusus.',
    low: 'Beberapa aspek sosial seperti kesejahteraan siswa dan kebijakan anti-perundungan belum terdokumentasi dengan baik. Sekolah disarankan mulai merancang program kesejahteraan siswa yang lebih menyeluruh dan terjadwal.',
  },
  governance: {
    high: 'Tata kelola sekolah menunjukkan transparansi dan akuntabilitas yang kuat, termasuk pelaporan keuangan dan aktivitas komite sekolah yang berjalan baik. Konsistensi ini penting untuk menjaga kepercayaan seluruh pemangku kepentingan.',
    mid: 'Tata kelola sekolah sudah berjalan cukup baik, namun transparansi laporan keuangan dan keterlibatan komite sekolah dapat ditingkatkan lagi agar lebih terbuka bagi orang tua dan masyarakat.',
    low: 'Aspek tata kelola, terutama transparansi keuangan dan perlindungan data siswa, memerlukan perbaikan mendesak. Disarankan menyusun kebijakan tata kelola tertulis serta menunjuk penanggung jawab yang jelas.',
  },
}

function band(score) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

function buildRecommendation(scores) {
  const overall = Math.round((scores.environmental + scores.social + scores.governance) / 3)
  const gradeText =
    overall >= 85 ? 'sangat baik' : overall >= 70 ? 'baik' : overall >= 55 ? 'cukup' : 'perlu banyak perbaikan'
  return {
    environmental: TEMPLATES.environmental[band(scores.environmental)],
    social: TEMPLATES.social[band(scores.social)],
    governance: TEMPLATES.governance[band(scores.governance)],
    summary: `Secara keseluruhan, sekolah ini memperoleh skor ESG sebesar ${overall} dari 100 yang tergolong ${gradeText}. Skor ini merupakan gabungan dari tiga aspek utama: Lingkungan (${scores.environmental}), Sosial (${scores.social}), dan Tata Kelola (${scores.governance}). Teks rekomendasi ini akan digantikan oleh hasil analisis otomatis dari sistem backend setelah proses integrasi selesai.`,
  }
}

export const mockScoreHistory = mockSchools.reduce((acc, school) => {
  acc[school.id] = buildHistory(school.scores)
  return acc
}, {})

export const mockRecommendations = mockSchools.reduce((acc, school) => {
  acc[school.id] = buildRecommendation(school.scores)
  return acc
}, {})
