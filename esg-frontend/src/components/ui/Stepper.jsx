import { Fragment } from 'react'
import { Check } from 'lucide-react'
import { classNames } from '../../utils/helpers.js'

// steps: [{ key, label, color, icon }]
// Warna tiap step secara sengaja = warna pilar ESG-nya, sehingga posisi
// pengisian form (Lingkungan -> Sosial -> Tata Kelola) terlihat sebagai
// progres nyata melewati tiga pilar, bukan sekadar angka 1/2/3 generik.
export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep
        const isActive = idx === currentStep
        const Icon = step.icon
        return (
          <Fragment key={step.key}>
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors"
                style={{
                  backgroundColor: isCompleted || isActive ? step.color : '#fff',
                  borderColor: step.color,
                  color: isCompleted || isActive ? '#fff' : step.color,
                  boxShadow: isActive ? `0 0 0 4px ${step.color}33` : 'none',
                }}
              >
                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={classNames(
                  'text-xs font-semibold text-center',
                  isActive ? 'text-slate-800' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mb-6"
                style={{ backgroundColor: idx < currentStep ? step.color : '#E2E8F0' }}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
