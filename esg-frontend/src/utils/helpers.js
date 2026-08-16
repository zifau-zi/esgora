// Simulasi jeda jaringan untuk mode mock, supaya loading state di UI benar-benar teruji.
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ')
}

export function getScoreGrade(score) {
  if (score >= 85) return { letter: 'A', label: 'Sangat Baik' }
  if (score >= 70) return { letter: 'B', label: 'Baik' }
  if (score >= 55) return { letter: 'C', label: 'Cukup' }
  return { letter: 'D', label: 'Perlu Perbaikan' }
}

// Parsing tanggal dari berbagai format: ISO, epoch, atau SQLite 'YYYY-MM-DD HH:MM:SS'.
export function parseDate(input) {
  if (input === null || input === undefined || input === '') return null
  const d = new Date(input)
  if (!Number.isNaN(d.getTime())) return d
  // SQLite datetime: 'YYYY-MM-DD HH:MM:SS' (tanpa 'T')
  const m = String(input).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (m) {
    const dt = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0))
    return Number.isNaN(dt.getTime()) ? null : dt
  }
  return null
}

export function formatDate(dateStr) {
  const d = parseDate(dateStr)
  if (!d) return dateStr || '-'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatFileSize(bytes) {
  if (bytes === undefined || bytes === null) return ''
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

// Menyeragamkan bentuk data skor {environmental, social, governance} menjadi
// array yang siap dipakai RadarChart & BarChart (Recharts).
export function toChartData(scores) {
  return [
    { subject: 'Lingkungan', category: 'environmental', score: scores.environmental },
    { subject: 'Sosial', category: 'social', score: scores.social },
    { subject: 'Tata Kelola', category: 'governance', score: scores.governance },
  ]
}
