import { useRef, useState } from 'react'
import { ESG_COLORS } from '../../utils/constants.js'

// Tema per pilar: warna utama + kelas glow ambient blob (sesuai spesifikasi).
const THEME = {
  environmental: { color: ESG_COLORS.environmental, glow: 'bg-green-400/50', border: 'border-green-500/30', label: 'Lingkungan' },
  social: { color: ESG_COLORS.social, glow: 'bg-orange-400/50', border: 'border-orange-500/30', label: 'Sosial' },
  governance: { color: ESG_COLORS.governance, glow: 'bg-blue-400/50', border: 'border-blue-500/30', label: 'Tata Kelola' },
}

// Placeholder ilustrasi (<img>) — SVG inline, tidak butuh aset eksternal.
const illustrationSrc = (color) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='160' height='160' rx='32' fill='${color}' opacity='0.18'/><circle cx='80' cy='80' r='42' fill='${color}' opacity='0.55'/></svg>`
  )}`

export default function ESGProfileCard({ type = 'environmental', icon: Icon, title, description, className = '' }) {
  const theme = THEME[type] || THEME.environmental
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ rx: -py * 10, ry: px * 10 })
  }

  const handleLeave = () => setTilt({ rx: 0, ry: 0 })

  return (
    <div className={`relative ${className}`}>
      {/* Behind glow (ambient blob) */}
      <div className={`absolute -inset-8 rounded-[2.5rem] blur-3xl opacity-40 ${theme.glow}`} aria-hidden />

      {/* Floating wrapper */}
      <div className="animate-float">
        <div
          ref={ref}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className={`relative overflow-hidden rounded-3xl border ${theme.border} bg-white/30 p-8 shadow-xl backdrop-blur-xl sm:p-10`}
          style={{
            transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.18s ease-out',
          }}
        >
          {/* Inner noise layer */}
          <div className="esg-noise" aria-hidden />

          <div className="relative flex flex-col items-center text-center" style={{ transform: 'translateZ(40px)' }}>
            <div className="relative mb-5 flex h-32 w-32 items-center justify-center">
              <img src={illustrationSrc(theme.color)} alt="" className="absolute inset-0 h-full w-full object-contain opacity-40" />
              {Icon && (
                <div
                  className="relative flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-lg"
                  style={{ backgroundColor: theme.color }}
                >
                  <Icon size={40} />
                </div>
              )}
            </div>
            {title && <h4 className="font-display text-lg font-bold text-slate-900">{title}</h4>}
            {description && <p className="mt-2 max-w-xs text-sm text-slate-600">{description}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
