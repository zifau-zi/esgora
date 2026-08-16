import { classNames } from '../../utils/helpers.js'

export default function Card({ children, className, glass = false, ...props }) {
  return (
    <div
      className={classNames(
        'rounded-2xl border bg-white shadow-soft',
        glass ? 'border-slate-200/70 bg-white/60 backdrop-blur-sm' : 'border-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
