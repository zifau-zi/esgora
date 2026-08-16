// ============================================================================
// Layer pengiriman (write) data formulir ESG dari Portal Admin.
// USE_MOCK true -> data hanya di-log ke console, tidak benar-benar terkirim.
// USE_MOCK false -> dikirim sebagai multipart/form-data (data JSON + file
// bukti) ke backend asli. Sesuaikan nama field jika kontrak API berbeda.
// ============================================================================
import apiClient from './apiClient.js'
import { USE_MOCK } from '../config.js'
import { delay } from '../utils/helpers.js'

// Pemetaan field form frontend → kode indikator backend (dari seed)
const ANSWER_MAP = [
  { code: 'E-01', get: (d) => statusToValue(d?.environmental?.wasteManagement) },
  { code: 'E-02', get: (d) => energyToValue(d?.environmental?.renewableEnergyPercent) },
  { code: 'S-01', get: (d) => statusToValue(d?.social?.healthProgram) },
  { code: 'G-01', get: (d) => statusToValue(d?.governance?.financialTransparency) },
  { code: 'G-02', get: (d) => statusToValue(d?.governance?.codeOfConduct) },
]

const STATUS_VALUE = { belum: 1, sebagian: 2, lengkap: 4 }
const ENERGY_CHOICES = [0, 25, 50, 75, 100]

function statusToValue(status = '') {
  return STATUS_VALUE[status] ?? 1
}

function energyToValue(percent = '') {
  const n = Number(percent)
  if (Number.isNaN(n) || n <= 0) return 0
  return ENERGY_CHOICES.reduce((best, c) =>
    Math.abs(n - c) < Math.abs(n - best) ? c : best
  , 0)
}

// Ambil daftar indikator backend untuk mapping kode → id (dicache supaya cepat).
let indicatorsCache = null
async function getIndicators() {
  if (indicatorsCache) return indicatorsCache
  try {
    const { data } = await apiClient.get('/indicators')
    indicatorsCache = Array.isArray(data) ? data : []
  } catch {
    indicatorsCache = []
  }
  return indicatorsCache
}

export async function submitESGData(schoolId, formData, files) {
  if (USE_MOCK) {
    await delay(1000)
    console.log('[MOCK] Submit data ESG untuk sekolah:', schoolId, { formData, files })
    return { success: true, message: 'Data berhasil disimpan (mode simulasi).' }
  }

  const indicators = await getIndicators()
  const idByCode = Object.fromEntries(indicators.map((i) => [i.code, i.id]))

  const answers = ANSWER_MAP
    .map((item) => ({
      indicatorId: idByCode[item.code],
      value: item.get(formData),
    }))
    .filter((a) => a.indicatorId != null)

  const payload = new FormData()
  if (schoolId != null) payload.append('school_id', String(schoolId))
  payload.append('year', String(new Date().getFullYear()))
  payload.append('answers', JSON.stringify(answers))

  const evidenceFor = []
  const appendSectionFiles = (sectionFiles, code) => {
    ;(sectionFiles || []).forEach((f) => {
      if (f?.file) {
        payload.append('evidence', f.file)
        evidenceFor.push({ indicatorId: idByCode[code] ?? null })
      }
    })
  }
  appendSectionFiles(files?.environmental, 'E-01')
  appendSectionFiles(files?.social, 'S-01')
  appendSectionFiles(files?.governance, 'G-01')

  if (evidenceFor.length > 0) {
    payload.append('evidenceFor', JSON.stringify(evidenceFor))
  }

  const { data } = await apiClient.post('/esg/assessments', payload)
  return data
}
