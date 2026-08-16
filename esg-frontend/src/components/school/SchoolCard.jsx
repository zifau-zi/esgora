import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import { ESG_COLORS } from '../../utils/constants.js'
import { getScoreGrade } from '../../utils/helpers.js'

export default function SchoolCard({ school }) {
  const grade = getScoreGrade(school.overallScore)
  const bars = [
    { key: 'environmental', v: school.scores.environmental },
    { key: 'social', v: school.scores.social },
    { key: 'governance', v: school.scores.governance },
  ]

  return (
    <Link
      to={`/sekolah/${school.id}`}
      className="group flex h-full flex-col rounded-2xl border border-transparent bg-white p-5 shadow-soft transition-shadow duration-300 hover:bg-white hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white">
            {school.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-800">{school.name}</h3>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={12} /> {school.city}, {school.province}
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {school.level}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {bars.map((item) => (
          <div key={item.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${item.v}%`, backgroundColor: ESG_COLORS[item.key] }} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-display text-2xl font-bold text-slate-900">
            {school.overallScore}
            <span className="text-sm font-medium text-slate-400">/100</span>
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Grade {grade.letter} · {grade.label}
          </p>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-slate-900 opacity-0 transition-opacity group-hover:opacity-100">
          Lihat Profil <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}
