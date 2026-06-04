import Icon from './Icon'

export default function Logo({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="grid place-items-center rounded-lg bg-slate-950 text-sky-300 shadow-sm"
        style={{ width: size, height: size }}
      >
        <Icon name="zap" className="h-5 w-5" />
      </div>
      <div className="leading-none">
        <div className="text-lg font-bold tracking-tight text-slate-950">VoltCost</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Estimator</div>
      </div>
    </div>
  )
}
