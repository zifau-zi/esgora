import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Users, ShieldCheck, Target, CheckCircle2, Circle, ClipboardList, BarChart3, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDate } from '../../utils/helpers.js'

const LOGO_GRADIENT = 'linear-gradient(135deg, #10B981 0%, #F59E0B 50%, #2563EB 100%)'

const GLASS =
  'rounded-2xl border border-white/40 bg-white/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg transition-all duration-500 ease-in-out hover:scale-[1.015] hover:shadow-lg'

const METRICS = [
  { key: 'environmental', label: 'Lingkungan', icon: Leaf, chip: 'bg-emerald-100 text-emerald-600', bar: 'from-emerald-400 to-teal-400' },
  { key: 'social', label: 'Sosial', icon: Users, chip: 'bg-orange-100 text-orange-600', bar: 'from-orange-400 to-rose-400' },
  { key: 'governance', label: 'Tata Kelola', icon: ShieldCheck, chip: 'bg-indigo-100 text-indigo-600', bar: 'from-indigo-400 to-blue-400' },
]

const QUESTS = [
  { title: 'Isi Formulir Energi Bulan Ini', done: false },
  { title: 'Lengkapi Profil Sosial Sekolah', done: true },
  { title: 'Verifikasi Data Tata Kelola', done: false },
  { title: 'Kirim Laporan ESG Kuartal II', done: true },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    if (user?.schoolId) {
      const mockSchools = {
        'sch-001': { name: 'SMA Negeri 1 Cendekia', overallScore: 84, scores: { environmental: 80, social: 88, governance: 83 }, lastUpdated: '2026-07-20' },
        'sch-002': { name: 'SD Islam Terpadu Nurul Ilmi', overallScore: 91, scores: { environmental: 90, social: 93, governance: 90 }, lastUpdated: '2026-07-15' },
        'sch-003': { name: 'SMP Negeri 5 Harapan Bangsa', overallScore: 88, scores: { environmental: 85, social: 90, governance: 89 }, lastUpdated: '2026-06-30' },
        'sch-004': { name: 'SMK Negeri 2 Teknologi Mandiri', overallScore: 76, scores: { environmental: 70, social: 78, governance: 80 }, lastUpdated: '2026-07-02' },
      }
      const fetchedSchool = mockSchools[user.schoolId] || null
      if (active && fetchedSchool) setSchool(fetchedSchool)
    }
    if (active) setLoading(false)
    return () => {
      active = false
    }
  }, [user?.schoolId])

  if (!user) return null

  const overall = school?.overallScore ?? 0

  return (
    <div className="relative space-y-5">
      {/* Atmosphere: faint glowing orbs for visual depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-4 h-72 w-72 rounded-full bg-emerald-400/30 blur-[120px]" />
        <div className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-indigo-400/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-400/30 blur-[120px]" />
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Halo, {user?.name || 'Siswa'} 👋</h1>
        <p className="mt-1 text-slate-500">
          Kontribusi ESG untuk{' '}
          <span className="font-semibold text-slate-700">{school?.name || user?.schoolName || 'Sekolah Anda'}</span>.
        </p>
      </div>

      {/* Top row metrics (Metrik Kontribusi) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {METRICS.map((m) => {
          const Icon = m.icon
          const value = school?.scores?.[m.key] ?? 0
          return (
            <div key={m.key} className={GLASS}>
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.chip}`}>
                  <Icon size={18} />
                </span>
                <span className="font-display text-2xl font-bold text-slate-900">{loading ? '...' : value}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-600">{m.label}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                <div className={`h-full rounded-full bg-gradient-to-r ${m.bar}`} style={{ width: `${value}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* School progress widget */}
        <div className={`${GLASS} md:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Pencapaian Sekolah</h2>
            <span className="text-xs font-medium text-slate-400">{loading ? '' : formatDate(school?.lastUpdated)}</span>
          </div>

          <div className="mt-4">
            <div className="flex items-end justify-between">
              <span className="text-sm text-slate-500">Skor ESG Keseluruhan</span>
              <span className="font-display text-3xl font-bold text-slate-900">{loading ? '...' : overall}</span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-indigo-500"
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {METRICS.map((m) => {
              const value = school?.scores?.[m.key] ?? 0
              return (
                <div key={m.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">{m.label}</span>
                    <span className="font-semibold text-slate-700">{value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                    <div className={`h-full rounded-full bg-gradient-to-r ${m.bar}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Quest widget (Misi ESG) */}
        <div className={`${GLASS} flex flex-col md:row-span-2`}>
          <div className="flex items-center gap-2">
            <Target size={16} className="text-indigo-500" />
            <h2 className="font-bold text-slate-800">Misi ESG</h2>
          </div>
          <ul className="mt-3 space-y-1.5">
            {QUESTS.map((q, i) => {
              const Icon = q.done ? CheckCircle2 : Circle
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 hover:bg-white/80"
                >
                  <Icon size={18} className={q.done ? 'text-emerald-500' : 'text-slate-300'} />
                  <span className={`text-sm ${q.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{q.title}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Refined action cards */}
        <Link
          to="/student/form-esg"
          className="group flex items-center gap-4 rounded-2xl border border-white/40 bg-white/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg transition-all duration-500 ease-in-out hover:scale-[1.015] hover:shadow-lg"
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
          to="/student/hasil-analisis"
          className="group flex items-center gap-4 rounded-2xl border border-white/40 bg-white/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg transition-all duration-500 ease-in-out hover:scale-[1.015] hover:shadow-lg"
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
