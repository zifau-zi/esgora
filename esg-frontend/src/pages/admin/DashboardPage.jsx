import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, BarChart3, ArrowRight, ArrowUp, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getSchoolById, getSchoolHistory } from '../../services/schoolService.js'
import ScoreGauge from '../../components/ui/ScoreGauge.jsx'
import Card from '../../components/ui/Card.jsx'
import { formatDate } from '../../utils/helpers.js'
import { ESG_COLORS } from '../../utils/constants.js'
import ESGHistoryChart from '../../components/charts/ESGHistoryChart.jsx'

const LOGO_GRADIENT = 'linear-gradient(135deg, #10B981 0%, #F59E0B 50%, #2563EB 100%)'

const TASKS = [
  { icon: AlertTriangle, tone: 'amber', text: 'Formulir Energi Bulan Juli belum diisi' },
  { icon: CheckCircle2, tone: 'emerald', text: 'Data Sosial berhasil diverifikasi' },
  { icon: BarChart3, tone: 'blue', text: 'Laporan ESG Kuartal II sudah dibagikan' },
  { icon: Bell, tone: 'slate', text: 'Pengisian ESG periode Juli–Agustus telah dibuka' },
]

const TONE = {
  amber: 'bg-amber-100 text-amber-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  slate: 'bg-slate-100 text-slate-500',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    if (user?.schoolId) {
      Promise.all([getSchoolById(user.schoolId), getSchoolHistory(user.schoolId)])
        .then(([res, hist]) => {
          if (!active) return
          setResult(res)
          setHistory(hist)
        })
        .catch(() => {
          if (active) setResult(null)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    } else {
      setLoading(false)
    }
    return () => {
      active = false
    }
  }, [user?.schoolId])

  const score = result?.overallScore ?? 0
  const pillars = [
    { key: 'environmental', label: 'Lingkungan', value: result?.scores?.environmental ?? 0 },
    { key: 'social', label: 'Sosial', value: result?.scores?.social ?? 0 },
    { key: 'governance', label: 'Tata Kelola', value: result?.scores?.governance ?? 0 },
  ]
  const kpis = [
    { label: 'Skor ESG Terakhir', value: loading ? '...' : result ? score : '-', trend: { text: '+2% dari bulan lalu', up: true } },
    { label: 'Terakhir Diperbarui', value: loading ? '...' : result ? formatDate(result.lastUpdated) : 'Belum ada data', trend: { text: 'Sinkron otomatis', up: true, muted: true } },
    { label: 'Status Data', value: loading ? '...' : 'Terverifikasi', trend: { text: '100% lengkap', up: true } },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Halo, {user?.name || 'Admin'} 👋</h1>
        <p className="mt-1 text-slate-500">
          Ringkasan performa ESG{' '}
          <span className="font-semibold text-slate-700">{user?.schoolName || 'Sekolah Anda'}</span>.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5 transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-slate-900">{k.value}</p>
            <p
              className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
                k.trend.up ? (k.trend.muted ? 'text-slate-400' : 'text-emerald-600') : 'text-rose-500'
              }`}
            >
              <ArrowUp size={13} className={k.trend.up ? '' : 'rotate-180'} />
              {k.trend.text}
            </p>
          </Card>
        ))}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Main analytics */}
        <Card className="p-5 sm:p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Ringkasan Skor per Aspek</h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">Realtime</span>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-around gap-2">
              {pillars.map((p) => (
                <div key={p.key} className="flex flex-col items-center gap-1.5">
                  <ScoreGauge value={p.value} color={ESG_COLORS[p.key]} size={76} />
                  <span className="text-xs font-semibold text-slate-500">{p.label}</span>
                </div>
              ))}
            </div>
            <div className="min-h-[180px] rounded-xl border border-slate-200/60 bg-slate-50/60 p-2">
              {history.length ? (
                <ESGHistoryChart data={history} height={180} />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">Grafik Histori</div>
              )}
            </div>
          </div>
        </Card>

        {/* Tasks & activity widget */}
        <Card className="flex flex-col p-5 sm:p-6 md:row-span-2">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-slate-400" />
            <h2 className="font-bold text-slate-800">Tugas &amp; Aktivitas</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {TASKS.map((t, i) => {
              const Icon = t.icon
              return (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white p-3">
                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${TONE[t.tone]}`}>
                    <Icon size={15} />
                  </span>
                  <p className="text-sm text-slate-600">{t.text}</p>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* Refined action cards */}
        <Link
          to="/admin/form-esg"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: LOGO_GRADIENT }}>
            <ClipboardList size={20} />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-slate-800">Isi / Perbarui Data ESG</p>
            <p className="text-xs text-slate-500">Lengkapi form Lingkungan, Sosial &amp; Tata Kelola</p>
          </div>
          <ArrowRight size={18} className="ml-auto flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/hasil-analisis"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <BarChart3 size={20} />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-slate-800">Lihat Hasil Analisis</p>
            <p className="text-xs text-slate-500">Skor lengkap &amp; rekomendasi sistem</p>
          </div>
          <ArrowRight size={18} className="ml-auto flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
