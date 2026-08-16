import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { ESG_COLORS } from '../../utils/constants.js'

const CATEGORY_COLOR = {
  environmental: ESG_COLORS.environmental,
  social: ESG_COLORS.social,
  governance: ESG_COLORS.governance,
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const color = CATEGORY_COLOR[item.category]
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
export default function ESGBarChart({ data, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
        <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={70}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={CATEGORY_COLOR[entry.category]} />
          ))}
          <LabelList dataKey="score" position="top" fill="#334155" fontSize={12} fontWeight={700} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
