import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { User, Lock, Mail, Eye, EyeOff, BarChart3, ShieldCheck, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { mockStudentUser, mockAdminUser } from '../../mock/auth.js'

const LOGO_GRADIENT = 'linear-gradient(135deg, #10B981 0%, #F59E0B 50%, #2563EB 100%)'

const FEATURES = [
  { icon: User, color: '#10B981', text: 'Isi data ESG sesuai profil siswa' },
  { icon: BarChart3, color: '#F59E0B', text: 'Lihat skor dan rekomendasi personal' },
  { icon: ShieldCheck, color: '#2563EB', text: 'Profil siswa tampil transparan' },
]

const SCHOOLS = [
  { id: 'sch-001', name: 'SMA Negeri 1 Cendekia', npsn: '20567891' },
  { id: 'sch-002', name: 'SD Islam Terpadu Nurul Ilmi', npsn: '20112233' },
  { id: 'sch-003', name: 'SMP Negeri 5 Harapan Bangsa', npsn: '20334455' },
  { id: 'sch-004', name: 'SMK Negeri 2 Teknologi Mandiri', npsn: '20556677' },
]

export default function StudentLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ nis: '', password: '', schoolId: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.schoolId) {
      setError('Pilih asal sekolah terlebih dahulu.')
      return
    }
    setLoading(true)
    try {
      await login({
        email: form.nis,
        password: form.password,
        schoolId: form.schoolId,
      })
      const redirectTo = location.state?.from || '/student/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa kembali NIS dan kata sandi Anda.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setForm({
      nis: mockStudentUser.nis,
      password: mockStudentUser.password,
      schoolId: mockStudentUser.profile.schoolId,
    })
    setError('')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex"
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #0F172A 55%, #1E293B 100%)' }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#10B981' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#2563EB' }} />

        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: LOGO_GRADIENT }}>
            <User size={20} />
          </div>
          <span className="font-display text-xl font-bold">ESG Sekolah</span>
        </div>

        <div className="relative">
          <h1 className="mb-4 font-display text-3xl font-bold leading-tight">
            Portal Siswa untuk Profil & Scoring ESG
          </h1>
          <p className="mb-8 max-w-md text-slate-300">
            Masuk untuk mengisi data Lingkungan, Sosial & Tata Kelola serta melihat skor personal.
          </p>
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${f.color}33` }}>
                  <f.icon size={16} style={{ color: f.color }} />
                </div>
                <span className="text-sm text-slate-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} ESG Sekolah. Seluruh hak cipta dilindungi.</p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: LOGO_GRADIENT }}>
              <User size={18} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-slate-900">ESG Sekolah</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900">Masuk Akun Siswa</h2>
          <p className="mt-1.5 text-sm text-slate-500">Masukkan NIS dan sekolah untuk mengakses dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">NIS</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.nis}
                  onChange={(e) => setForm((f) => ({ ...f, nis: e.target.value }))}
                  placeholder="12345678"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition-shadow focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Kata Sandi</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition-shadow focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Asal Sekolah</label>
              <div className="relative">
                <select
                  value={form.schoolId}
                  onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3.5 pr-3.5 text-sm text-slate-800 outline-none transition-shadow focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">-- Pilih Sekolah --</option>
                  {SCHOOLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
            </Button>
          </form>

          <button
            onClick={fillDemo}
            type="button"
            className="mt-4 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Gunakan Akun Demo (NIS: {mockStudentUser.nis}, Password: {mockStudentUser.password})
          </button>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              <ArrowLeft size={15} /> Kembali ke Beranda Umum
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}