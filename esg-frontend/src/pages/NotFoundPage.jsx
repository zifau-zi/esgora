import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <SearchX size={28} className="text-slate-500" />
      </div>
      <h1 className="font-display text-3xl font-bold text-slate-900">404</h1>
      <p className="mt-2 max-w-sm text-slate-500">Halaman yang Anda cari tidak ditemukan atau sudah dipindahkan.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        <Home size={16} /> Kembali ke Beranda
      </Link>
    </div>
  )
}
