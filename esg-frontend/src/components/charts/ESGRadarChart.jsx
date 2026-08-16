import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ESG_COLORS } from '../../utils/constants.js'

const CATEGORY_COLOR = {
  Lingkungan: ESG_COLORS.environmental,
  Sosial: ESG_COLORS.social,
  'Tata Kelola': ESG_COLORS.governance,
}

function ColoredDot({ cx, cy, payload }) {
  const color = CATEGORY_COLOR[payload.subject] || '#0F172A'
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
}

function ColoredTick({ payload, x, y, textAnchor }) {
  const color = CATEGORY_COLOR[payload.value] || '#64748B'
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill={color} fontSize={13} fontWeight={700}>
      {payload.value}
    </text>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const color = CATEGORY_COLOR[item.subject] || '#0F172A'
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold" style={{ color }}>
        {item.subject}
      </p>
      <p className="text-slate-600">
        Skor: <span className="font-bold text-slate-800">{item.score}</span>/100
      </p>
    </div>
  )
}

// data: [{ subject: 'Lingkungan', category: 'environmental', score: 80 }, ...]
export default function ESGRadarChart({ data, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis dataKey="subject" tick={<ColoredTick />} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} tickCount={5} />
        <Radar
          name="Skor ESG"
          dataKey="score"
          stroke="#334155"
          fill="#334155"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={<ColoredDot />}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
