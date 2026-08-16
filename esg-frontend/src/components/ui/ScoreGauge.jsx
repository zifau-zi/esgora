import { useId } from 'react'

// Gauge lingkaran progres skor 0-100.
// gradient=true -> dipakai KHUSUS untuk "Skor Keseluruhan": stroke-nya adalah
// gradient hijau->kuning->biru, elemen "signature" yang merepresentasikan
// gabungan tiga pilar E/S/G sekaligus. Gauge per-pilar (E, S, atau G) selalu
// pakai warna tunggal lewat prop `color`.
export default function ScoreGauge({ value = 0, color = '#0F172A', size = 120, strokeWidth = 10, gradient = false, label }) {
  const uid = useId()
  const gradientId = `esgGaugeGradient-${uid}`
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, value))
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-slate-900" style={{ fontSize: size * 0.26 }}>
          {Math.round(progress)}
        </span>
        {label && (
          <span className="text-slate-400 font-medium" style={{ fontSize: Math.max(size * 0.09, 9) }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
