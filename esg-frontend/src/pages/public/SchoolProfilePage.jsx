import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, ArrowLeft, BadgeCheck, Calendar } from 'lucide-react'
import { getSchoolById, getSchoolHistory, getSchoolRecommendations } from '../../services/schoolService.js'
import ScoreGauge from '../../components/ui/ScoreGauge.jsx'
import Card from '../../components/ui/Card.jsx'
import ESGRadarChart from '../../components/charts/ESGRadarChart.jsx'
import ESGBarChart from '../../components/charts/ESGBarChart.jsx'
import ESGHistoryChart from '../../components/charts/ESGHistoryChart.jsx'
import { LoadingScreen, ErrorState } from '../../components/ui/Feedback.jsx'
import { ESG_COLORS } from '../../utils/constants.js'
import { toChartData, getScoreGrade, formatDate } from '../../utils/helpers.js'

const BREAKDOWN_ITEMS = [
  { key: 'environmental', label: 'Lingkungan' },
  { key: 'social', label: 'Sosial' },
  { key: 'governance', label: 'Tata Kelola' },
]

export default function SchoolProfilePage() {
  const { schoolId } = useParams()
  const [school, setSchool] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([getSchoolById(schoolId), getSchoolHistory(schoolId), getSchoolRecommendations(schoolId)])
      .then(([s, h, recs]) => {
        if (!s) {
          setError('Sekolah tidak ditemukan.')
          return
        }
        setSchool({ ...s, recommendations: recs })
        setHistory(h)
      })
      .catch(() => setError('Gagal memuat profil sekolah.'))
      .finally(() => setLoading(false))
  }, [schoolId])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <LoadingScreen label="Memuat profil sekolah..." />
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <ErrorState message={error} />
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm font-semibold text-slate-900">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const grade = getScoreGrade(school.overallScore)
  const chartData = toChartData(school.scores)

  return (
    <div className="pb-16">
      <div className="border-b border-slate-200/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft size={15} /> Kembali ke Pencarian
          </Link>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
                {school.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">{school.name}</h1>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{school.level}</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={13} /> {school.address}, {school.city}, {school.province}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <BadgeCheck size={12} /> Akreditasi {school.accreditation} · NPSN{' '}
                    <span className="font-mono">{school.npsn}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> Dipublikasikan {formatDate(school.publishedAt)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-start rounded-2xl border border-slate-200/70 bg-white/60 px-6 py-4 backdrop-blur-sm lg:self-auto">
              <ScoreGauge value={school.overallScore} gradient size={80} strokeWidth={8} />
              <div>
                <p className="text-xs font-medium text-slate-500">Skor ESG Keseluruhan</p>
                <p className="mt-1 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                  Grade {grade.letter} · {grade.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-3 gap-4">
          {BREAKDOWN_ITEMS.map((item) => (
            <Card key={item.key} glass className="flex flex-col items-center gap-2 p-4 sm:p-6">
              <ScoreGauge value={school.scores[item.key]} color={ESG_COLORS[item.key]} size={72} />
              <span className="text-xs font-semibold text-slate-500 sm:text-sm">{item.label}</span>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card glass className="p-5 sm:p-6">
            <h2 className="mb-2 font-bold text-slate-800">Radar Breakdown E/S/G</h2>
            <ESGRadarChart data={chartData} />
          </Card>
          <Card glass className="p-5 sm:p-6">
            <h2 className="mb-2 font-bold text-slate-800">Perbandingan Skor per Aspek</h2>
            <ESGBarChart data={chartData} />
          </Card>
        </div>

        <Card glass className="p-5 sm:p-6">
          <h2 className="mb-2 font-bold text-slate-800">
            Riwayat Progres Skor {history.length > 0 && `(${history[0].year}–${history[history.length - 1].year})`}
          </h2>
          <ESGHistoryChart data={history} />
        </Card>

        {school.recommendations?.summary && (
          <Card glass className="p-5 sm:p-8">
            <h2 className="mb-3 font-bold text-slate-800">Ringkasan</h2>
            <p className="text-sm leading-relaxed text-slate-600">{school.recommendations.summary}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
