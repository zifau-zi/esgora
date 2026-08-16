import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Semua field di sini menerima prop `color` (hex) untuk ring/border fokus.
// Fokus dikelola lewat state lokal (bukan CSS :focus) supaya warna dinamis
// per-pilar (hijau/kuning/biru) selalu presisi tanpa bergantung pada kelas
// Tailwind yang dibuat dinamis (yang tidak akan ter-generate saat build).

export function TextField({ label, hint, color = '#0F172A', className, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-shadow placeholder:text-slate-400"
        style={{
          borderColor: focused ? color : '#CBD5E1',
          boxShadow: focused ? `0 0 0 3px ${color}22` : 'none',
        }}
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function TextAreaField({ label, hint, color = '#0F172A', className, rows = 3, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      <textarea
        {...props}
        rows={rows}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          props.onBlur?.(e)
        }}
        className="w-full resize-none rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-shadow placeholder:text-slate-400"
        style={{
          borderColor: focused ? color : '#CBD5E1',
          boxShadow: focused ? `0 0 0 3px ${color}22` : 'none',
        }}
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function SelectField({ label, options, color = '#0F172A', hint, className, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        <select
          {...props}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className="w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-800 outline-none transition-shadow"
          style={{
            borderColor: focused ? color : '#CBD5E1',
            boxShadow: focused ? `0 0 0 3px ${color}22` : 'none',
          }}
        >
          <option value="">Pilih...</option>
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value
            const lbl = typeof opt === 'string' ? opt : opt.label
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            )
          })}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function RadioGroupField({ label, options, value, onChange, color = '#0F172A' }) {
  return (
    <div>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const active = value === opt.value
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-colors"
              style={{
                borderColor: active ? color : '#E2E8F0',
                backgroundColor: active ? `${color}14` : '#fff',
                color: active ? color : '#475569',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
