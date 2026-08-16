import { Outlet, Link } from 'react-router-dom'
import { Leaf, ShieldCheck, User } from 'lucide-react'
import Scanner from '../reactbits/backgrounds/Scanner.jsx'

const LOGO_GRADIENT = 'linear-gradient(135deg, #10B981 0%, #F59E0B 50%, #2563EB 100%)'

function PublicNavbar() {
  return (
    <div className="sticky top-4 z-40 px-4 sm:px-6">
      <header
        className="mx-auto max-w-6xl rounded-2xl px-4 py-3 sm:px-6"
        style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 8px 32px rgba(100, 116, 139, 0.12), 0 2px 8px rgba(100, 116, 139, 0.08)',
        }}
      >
        <div className="flex h-12 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm" style={{ background: LOGO_GRADIENT }}>
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-slate-900">ESG Sekolah</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              Beranda
            </Link>
            <a
              href="/#tentang-esg"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              Tentang ESG
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/student/login"
              className="btn-gradient-border btn-student inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all sm:px-3.5 sm:text-sm"
            >
              <User size={14} className="text-emerald-600" /> Portal Siswa
            </Link>
            <Link
              to="/admin/login"
              className="btn-gradient-border btn-admin inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all sm:px-3.5 sm:text-sm"
            >
              <ShieldCheck size={14} /> Portal Admin
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}

function PublicFooter() {
  return (
    <footer
      className="relative border-t-0"
      style={{ background: 'linear-gradient(rgb(255 255 255 / 92%) 0%, rgb(146 240 255 / 31%) 45%, rgb(129 129 129) 100%)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: LOGO_GRADIENT }}>
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-800">ESG Sekolah</span>
          </div>
      <p className="text-center text-sm text-[rgb(0,75,181)]">
        © {new Date().getFullYear()} ESG Sekolah. Mendorong transparansi & keberlanjutan pendidikan Indonesia.
      </p>
        </div>
      </div>
    </footer>
  )
}

export default function PublicLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Gradient waves background — base background halaman publik */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(135deg, #BFDBFE 0%, #FFFFFF 30%, #DBEAFE 60%, #60A5FA 100%)',
        }}
      >
        <Scanner
          color1="#27cfff"
          color2="#a741e8"
          color3="#ffffff"
          speed={0.6}
          scanDirection="vertical"
          opacity={0.9}
          mouseInteraction
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicNavbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </div>
  )
}
