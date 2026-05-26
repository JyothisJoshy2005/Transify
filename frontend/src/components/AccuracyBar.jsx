import { getAccuracyClass, getAccuracyLabel } from '../utils/helpers'

export default function AccuracyBar({ accuracy }) {
  if (!accuracy && accuracy !== 0) return null
  const pct = Math.round(accuracy)
  const cls = getAccuracyClass(pct)
  const label = getAccuracyLabel(pct)

  const barColor =
    pct >= 85 ? 'bg-emerald-500' :
    pct >= 65 ? 'bg-amber-500'   :
                'bg-red-500'

  return (
    <div className="space-y-1.5 animate-fade-in">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Translation Accuracy</span>
        <span className={cls}>{label} · {pct}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
