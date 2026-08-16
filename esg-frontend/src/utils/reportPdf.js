// ============================================================================
// Generator laporan PDF analisis ESG (menggunakan jsPDF + autotable).
// Dipakai tombol "Unduh Laporan" di halaman Hasil Analisis admin.
// ============================================================================
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = {
  environmental: [16, 185, 129],
  social: [245, 158, 11],
  governance: [37, 99, 235],
  ink: [15, 23, 42],
  slate: [100, 116, 139],
  soft: [241, 245, 249],
}

const PILLAR_KEYS = [
  { key: 'environmental', label: 'Lingkungan' },
  { key: 'social', label: 'Sosial' },
  { key: 'governance', label: 'Tata Kelola' },
]

function gradeFor(score) {
  if (score >= 85) return { letter: 'A', label: 'Sangat Baik' }
  if (score >= 70) return { letter: 'B', label: 'Baik' }
  if (score >= 55) return { letter: 'C', label: 'Cukup' }
  return { letter: 'D', label: 'Perlu Perbaikan' }
}

function round(value) {
  const n = Number(value)
  return Number.isNaN(n) ? 0 : Math.round(n)
}

function slugify(name = '') {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'esg'
}

// result = data sekolah ternormalisasi (lihat services/normalize.js)
export function downloadReport({ result, history = [], user = {} }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = 0

  // ---------- Header ----------
  doc.setFillColor(...COLORS.ink)
  doc.rect(0, 0, pageWidth, 34, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Laporan Analisis ESG Sekolah', margin, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(result?.name || '-', margin, 26)
  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225)
  const metaLine = [
    result?.npsn ? `NPSN ${result.npsn}` : '',
    result?.level || '',
    result?.accreditation ? `Akreditasi ${result.accreditation}` : '',
    user?.schoolName || '',
  ]
    .filter(Boolean)
    .join('  ·  ')
  doc.text(metaLine || ' ', margin, 30)

  y = 46

  // ---------- Ringkasan skor ----------
  const grade = gradeFor(result?.overallScore)
  doc.setFillColor(...COLORS.soft)
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F')

  doc.setFillColor(...COLORS.ink)
  doc.roundedRect(margin + 6, y + 6, 46, 22, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(String(round(result?.overallScore)), margin + 6 + 23, y + 18, { align: 'center' })
  doc.setFontSize(8)
  doc.setTextColor(203, 213, 225)
  doc.text('dari 100', margin + 6 + 23, y + 23, { align: 'center' })

  doc.setTextColor(...COLORS.ink)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Predikat ${grade.letter} · ${grade.label}`, margin + 60, y + 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.slate)
  doc.text('Skor keseluruhan adalah gabungan dari tiga pilar berikut:', margin + 60, y + 19)
  const updatedText = result?.lastUpdated ? `Terakhir diperbarui: ${result.lastUpdated}` : ''
  doc.text(updatedText || ' ', margin + 60, y + 26)

  y += 44

  // ---------- Skor per pilar ----------
  doc.setTextColor(...COLORS.ink)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Skor per Aspek', margin, y)
  y += 7

  PILLAR_KEYS.forEach(({ key, label }) => {
    const score = round(result?.scores?.[key])
    const barMax = contentWidth - 16
    const barFull = (score / 100) * barMax
    const color = COLORS[key]

    // bar background
    doc.setFillColor(226, 232, 240)
    doc.roundedRect(margin, y, barMax, 5, 2.5, 2.5, 'F')
    // bar value
    doc.setFillColor(...color)
    doc.roundedRect(margin, y, Math.max(5, barFull), 5, 2.5, 2.5, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.ink)
    doc.text(label, margin, y - 2)
    doc.setTextColor(...color)
    doc.text(`${score}`, margin + barMax, y - 2, { align: 'right' })
    y += 12
  })

  y += 6

  // ---------- Riwayat skor ----------
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.ink)
  doc.text('Riwayat Progres Skor', margin, y)
  y += 4

  if (Array.isArray(history) && history.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Tahun', 'Lingkungan', 'Sosial', 'Tata Kelola', 'Total']],
      body: history.map((h) => [
        String(h.year),
        String(round(h.environmental)),
        String(round(h.social)),
        String(round(h.governance)),
        String(round(h.overall)),
      ]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.ink, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: COLORS.ink },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })
    y = doc.lastAutoTable.finalY + 10
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.slate)
    doc.text('Belum ada riwayat skor untuk sekolah ini.', margin, y + 2)
    y += 12
  }

  // ---------- Rekomendasi ----------
  const recs = result?.recommendations || {}
  if (recs.summary) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...COLORS.ink)
    doc.text('Rekomendasi', margin, y)
    y += 7

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.slate)
    doc.text(doc.splitTextToSize(recs.summary, contentWidth), margin, y)
    y += doc.getTextDimensions(doc.splitTextToSize(recs.summary, contentWidth), { maxWidth: contentWidth }).h + 8

    PILLAR_KEYS.forEach(({ key, label }) => {
      const text = recs[key]
      if (!text) return
      const color = COLORS[key]
      doc.setFillColor(color[0], color[1], color[2])
      doc.rect(margin, y, 2, 10, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...COLORS.ink)
      doc.text(label, margin + 6, y + 7)

      y += 9
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.slate)
      const lines = doc.splitTextToSize(text, contentWidth - 6)
      doc.text(lines, margin + 6, y + 3)
      y += 3 + lines.length * 4 + 8
    })
  }

  // ---------- Footer ----------
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.slate)
  doc.text(
    `Laporan dibuat otomatis oleh sistem ESG Sekolah · ${new Date().toLocaleDateString('id-ID')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  doc.save(`Laporan-ESG-${slugify(result?.name)}.pdf`)
}
