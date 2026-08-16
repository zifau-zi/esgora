import { classNames } from '../../utils/helpers.js'

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

// color = warna dinamis (hex) yang diterapkan lewat inline style, bukan
// class Tailwind, supaya aman dipakai untuk warna pilar E/S/G yang mana pun.
export default function Button({
  variant = 'primary',
  color = '#0F172A',
  size = 'md',
  className,
  children,
  ...props
}) {
  if (variant === 'outline') {
    return (
      <button
        className={classNames(BASE, SIZES[size], 'bg-white border-2 hover:bg-slate-50', className)}
        style={{ borderColor: color, color }}
        {...props}
      >
        {children}
      </button>
    )
  }

  if (variant === 'ghost') {
    return (
      <button
        className={classNames(BASE, SIZES[size], 'text-slate-600 hover:bg-slate-100', className)}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={classNames(BASE, SIZES[size], 'text-white shadow-sm hover:shadow-md', className)}
      style={{ backgroundColor: color }}
      {...props}
    >
      {children}
    </button>
  )
}
