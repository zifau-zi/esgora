export function Spinner({ size = 24, color = '#0F172A' }) {
  return (
    <div
      className="animate-spin rounded-full border-4 border-slate-200"
      style={{ width: size, height: size, borderTopColor: color }}
    />
  )
}

export function LoadingScreen({ label = 'Memuat data...' }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3">
      <Spinner size={36} />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300/80 bg-white/50 px-6 py-14 text-center backdrop-blur-sm">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon size={26} className="text-slate-400" />
        </div>
      )}
      <div>
        <h3 className="font-semibold text-slate-700">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
      <p className="text-sm font-medium text-red-600">{message || 'Terjadi kesalahan saat memuat data.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-red-700 underline underline-offset-2">
          Coba lagi
        </button>
      )}
    </div>
  )
}
