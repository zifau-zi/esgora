import { useEffect, useState } from 'react'
import { Leaf, Users, ShieldCheck, RefreshCcw, Download } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getSchoolById, getSchoolHistory, getSchoolRecommendations } from '../../services/schoolService.js'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import ScoreGauge from '../../components/ui/ScoreGauge.jsx'
import ESGRadarChart from '../../components/charts/ESGRadarChart.jsx'
import ESGBarChart from '../../components/charts/ESGBarChart.jsx'
import ESGHistoryChart from '../../components/charts/ESGHistoryChart.jsx'
import { LoadingScreen, ErrorState } from '../../components/ui/Feedback.jsx'
import { ESG_COLORS } from '../../utils/constants.js'
import { toChartData, getScoreGrade, formatDate } from '../../utils/helpers.js'
import { downloadReport } from '../../utils/reportPdf.js'

const RECOMMENDATION_ICONS = { environmental: Leaf, social: Users, governance: ShieldCheck }
const RECOMMENDATION_LABELS = { environmental: 'Lingkungan', social: 'Sosial', governance: 'Tata Kelola' }
const PILLAR_KEYS = ['environmental', 'social', 'governance']

export default function ResultsPage() {
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = () => {
    if (!user?.schoolId) {
      setLoading(false)
      setError('Sesi tidak valid atau ID Sekolah tidak ditemukan.')
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([
      getSchoolById(user.schoolId),
      getSchoolHistory(user.schoolId),
      getSchoolRecommendations(user.schoolId),
    ])
      .then(([school, hist, recs]) => {
        setResult({ ...school, recommendations: recs })
        setHistory(hist)
      })
      .catch(() => setError('Gagal memuat hasil analisis. Data mungkin belum tersedia dari server.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.schoolId])

  if (loading) {
    return <LoadingScreen label="Memuat hasil analisis dari server..." />
  }

  if (error || !result) {
    return <ErrorState message={error} onRetry={loadData} />
  }

  const grade = getScoreGrade(result.overallScore)
  const chartData = toChartData(result.scores)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Hasil Analisis ESG</h1>
          <p className="mt-1 text-slate-500">
            {user?.schoolName || 'Sekolah'} · Dipublikasikan {formatDate(result.publishedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCcw size={14} /> Muat Ulang
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReport({ result, history, user })}
          >
            <Download size={14} /> Unduh Laporan
          </Button>
        </div>
      </div>

      <Card className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto,1fr] lg:items-center">
        <div className="flex flex-col items-center gap-2 justify-self-center">
          <ScoreGauge value={result.overallScore} gradient size={150} strokeWidth={12} />
          <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white">
            Grade {grade.letter} · {grade.label}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          <div className="flex flex-col items-center gap-2">
            <ScoreGauge value={result.scores.environmental} color={ESG_COLORS.environmental} size={88} />
            <span className="text-xs font-semibold text-slate-500">Lingkungan</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ScoreGauge value={result.scores.social} color={ESG_COLORS.social} size={88} />
            <span className="text-xs font-semibold text-slate-500">Sosial</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ScoreGauge value={result.scores.governance} color={ESG_COLORS.governance} size={88} />
            <span className="text-xs font-semibold text-slate-500">Tata Kelola</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-2 font-bold text-slate-800">Radar Breakdown E/S/G</h2>
          <ESGRadarChart data={chartData} />
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="mb-2 font-bold text-slate-800">Perbandingan Skor per Aspek</h2>
          <ESGBarChart data={chartData} />
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <h2 className="mb-2 font-bold text-slate-800">Riwayat Progres Skor</h2>
        <ESGHistoryChart data={history} />
      </Card>

      <Card className="p-5 sm:p-8">
        <h2 className="mb-1 font-bold text-slate-800">Rekomendasi &amp; Saran Otomatis</h2>
        <p className="mb-5 text-sm text-slate-500">Dihasilkan otomatis oleh sistem berdasarkan data yang telah dimasukkan.</p>

        {result.recommendations?.summary && (
          <p className="mb-6 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            {result.recommendations.summary}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {PILLAR_KEYS.map((key) => {
            const Icon = RECOMMENDATION_ICONS[key]
            const color = ESG_COLORS[key]
            const text = result.recommendations?.[key]
            if (!text) return null
            return (
              <div key={key} className="rounded-xl border-l-4 bg-white p-4" style={{ borderColor: color, backgroundColor: `${color}0A` }}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon size={16} style={{ color }} />
                  <span className="text-sm font-bold" style={{ color }}>
                    {RECOMMENDATION_LABELS[key]}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
