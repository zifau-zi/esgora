import { useEffect, useState } from 'react'
import { Search, Leaf, Users, ShieldCheck } from 'lucide-react'
import SchoolCard from '../../components/school/SchoolCard.jsx'
import { getSchools } from '../../services/schoolService.js'
import { LoadingScreen, EmptyState } from '../../components/ui/Feedback.jsx'
import { ESG_COLORS } from '../../utils/constants.js'
import Aurora from '../../components/reactbits/backgrounds/Aurora.jsx'
import Particles from '../../components/reactbits/backgrounds/Particles.jsx'
import Magnet from '../../components/reactbits/animations/Magnet.jsx'
import BorderGlow from '../../components/reactbits/components/BorderGlow.jsx'
import TiltCard from '../../components/reactbits/components/TiltCard.jsx'
import CityMarquee from '../../components/city/CityMarquee.jsx'
import ESGProfileCard from '../../components/esg/ESGProfileCard.jsx'
import ScrollReveal from '../../components/reactbits/text/ScrollReveal.jsx'
import BlurText from '../../components/reactbits/text/BlurText.jsx'

const PILLARS = [
  {
    key: 'environmental',
    label: 'Environmental',
    title: 'Lingkungan (Environmental)',
    color: ESG_COLORS.environmental,
    icon: Leaf,
    desc: 'Pengelolaan lingkungan, efisiensi energi, dan ruang hijau yang mendukung sekolah yang sehat dan berkelanjutan.',
    points: ['Pengelolaan & daur ulang sampah', 'Efisiensi energi terbarukan', 'Ruang hijau & konservasi air'],
  },
  {
    key: 'social',
    label: 'Social',
    title: 'Sosial (Social)',
    color: ESG_COLORS.social,
    icon: Users,
    desc: 'Kesejahteraan siswa & guru, inklusivitas, dan hubungan harmonis dengan masyarakat sekitar sekolah.',
    points: ['Kesejahteraan & bantuan siswa', 'Inklusivitas & aksesibilitas', 'Anti-perundungan & kesehatan'],
  },
  {
    key: 'governance',
    label: 'Governance',
    title: 'Tata Kelola (Governance)',
    color: ESG_COLORS.governance,
    icon: ShieldCheck,
    desc: 'Transparansi, akuntabilitas, dan tata kelola kelembagaan yang menjaga kepercayaan pemangku kepentingan.',
    points: ['Transparansi laporan keuangan', 'Kode etik & anti-korupsi', 'Perlindungan data sekolah'],
  },
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      getSchools(query)
        .then(setSchools)
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const avgScore = schools.length ? Math.round(schools.reduce((a, s) => a + s.overallScore, 0) / schools.length) : 0
  const gradeACount = schools.filter((s) => s.overallScore >= 85).length

  return (
    <div>
      {/* HERO — full bleed dari tepi ke tepi, di balik floating navbar */}
      <section
        className="relative overflow-hidden bg-slate-900"
        style={{ marginTop: '-5rem' }}
      >
        <div className="pointer-events-none absolute inset-0">
          <Aurora colorStops={[ESG_COLORS.environmental, ESG_COLORS.social, ESG_COLORS.governance]} amplitude={1.2} />
          <div className="pointer-events-none absolute inset-0 bg-slate-900/55" />
          <div className="absolute inset-0">
            <Particles
              particleCount={100}
              particleColors={[ESG_COLORS.environmental, ESG_COLORS.social, ESG_COLORS.governance]}
              particleBaseSize={110}
              sizeRandomness={1.4}
              speed={0.09}
              alphaParticles
              moveParticlesOnHover
              particleHoverFactor={0.2}
            />
          </div>
        </div>

        {/* Bottom fade ke konten di bawah */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-44 backdrop-blur-[6px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0.95)_0%,transparent_100%)]" />

        {/* Konten hero — padding atas memperhitungkan navbar floating (top-4 + h-12 + py-3) ≈ 80px */}
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6" style={{ paddingTop: 'calc(5rem + 80px)', paddingBottom: '8rem' }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: ESG_COLORS.environmental }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: ESG_COLORS.social, animationDelay: '0.3s' }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: ESG_COLORS.governance, animationDelay: '0.6s' }} />
            Transparansi Environmental · Social · Governance
          </span>

          <BlurText
            text="Cari rekam jejak ESG sekolah mana pun."
            className="mx-auto mt-7 max-w-4xl justify-center font-display text-4xl font-bold leading-[1.1] text-white sm:text-6xl lg:text-7xl"
            delay={30}
            animateBy="words"
            direction="top"
          />
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
            Skor Lingkungan, Sosial, dan Tata Kelola — terbuka untuk dilihat semua orang tua, siswa, dan masyarakat.
          </p>

          <div className="relative z-10 mx-auto mt-12 max-w-2xl">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white p-2 shadow-2xl backdrop-blur-sm sm:p-3">
              <Search size={20} className="ml-2.5 flex-shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Cari nama sekolah atau kota..."
                className="w-full min-w-0 bg-transparent px-1 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
              />
              <Magnet padding={40} magnetStrength={3} wrapperClassName="flex-shrink-0">
                <button className="flex-shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg sm:px-6 sm:py-3">
                  Cari
                </button>
              </Magnet>
            </div>
            <div className="mt-4">
              <CityMarquee activeCity={query} onSelect={setQuery} />
            </div>
          </div>
        </div>
      </section>

      {/* Ringkasan statistik — kuat tapi tenang, tidak bersaing dengan hero */}
      <section className="border-b border-slate-200/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-sm sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-slate-900">{schools.length}</span>
            <span className="text-slate-500">sekolah terdaftar</span>
          </div>
          <div className="hidden h-4 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-slate-900">{avgScore || '-'}</span>
            <span className="text-slate-500">rata-rata skor ESG</span>
          </div>
          <div className="hidden h-4 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-slate-900">{gradeACount}</span>
            <span className="text-slate-500">sekolah predikat A</span>
          </div>
        </div>
      </section>

      {/* Hasil pencarian / daftar sekolah */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-5 text-lg font-bold text-slate-800">
          {query ? `Hasil pencarian untuk "${query}"` : 'Daftar Sekolah'}
        </h2>
        {loading ? (
          <LoadingScreen label="Memuat data sekolah..." />
        ) : schools.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Sekolah tidak ditemukan"
            description="Coba gunakan kata kunci lain, misalnya nama kota."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((s) => (
              <TiltCard
                key={s.id}
                maxTilt={4}
                hoverScale={1.02}
                className="h-full"
              >
                <BorderGlow
                  className="!border-slate-200 h-full rounded-2xl"
                  colors={[ESG_COLORS.environmental, '#34D399', ESG_COLORS.governance]}
                  glowColor="150 70 45"
                  backgroundColor="rgba(255, 255, 255, 0.9)"
                  borderRadius={16}
                  glowRadius={18}
                  glowIntensity={1.1}
                  coneSpread={24}
                >
                  <SchoolCard school={s} />
                </BorderGlow>
              </TiltCard>
            ))}
          </div>
        )}
      </section>

      {/* Edukasi singkat tiga pilar ESG */}
      <section id="tentang-esg" className="border-t border-slate-200/70 bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <ScrollReveal
              baseOpacity={0}
              baseRotation={2}
              blurStrength={2}
              containerClassName="mb-0 text-center"
              textClassName="font-display text-2xl font-bold text-slate-900"
            >
              Apa itu ESG untuk Sekolah?
            </ScrollReveal>
            <p className="mt-2 text-slate-500">Tiga pilar utama yang menjadi dasar penilaian keberlanjutan sekolah.</p>
          </div>
          <div className="space-y-14 sm:space-y-20">
            {PILLARS.map((item, i) => {
              const imageLeft = i % 2 === 1
              return (
                <div key={item.key} className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
                  {/* Teks */}
                  <div className={`order-2 lg:order-${imageLeft ? '2' : '1'}`}>
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                      style={{ color: item.color, backgroundColor: `${item.color}1A` }}
                    >
                      <item.icon size={14} /> {item.label}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold text-slate-900 sm:text-3xl">{item.title}</h3>
                    <p className="mt-3 text-slate-600">{item.desc}</p>
                    <ul className="mt-5 space-y-2.5">
                      {item.points.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual / Gambar */}
                  <div className={`order-1 lg:order-${imageLeft ? '1' : '2'}`}>
                    <ESGProfileCard
                      type={item.key}
                      icon={item.icon}
                      title={item.label}
                      description={item.desc}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
