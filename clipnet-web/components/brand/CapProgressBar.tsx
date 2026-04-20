import { capFraction, formatShortCurrency } from '@/lib/utils/format'

interface CapProgressBarProps {
  paidOut: number
  campaignCap: number
  className?: string
}

export function CapProgressBar({ paidOut, campaignCap, className = '' }: CapProgressBarProps) {
  const fraction = capFraction(paidOut, campaignCap)
  const pct = Math.round(fraction * 100)

  const barColor =
    fraction >= 0.9
      ? 'bg-cn-danger'
      : fraction >= 0.7
        ? 'bg-cn-amber'
        : 'bg-cn-teal'

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-xs text-cn-muted">
        <span>{formatShortCurrency(paidOut)} spent</span>
        <span>{pct}% of {formatShortCurrency(campaignCap)}</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-cn-border overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Campaign spend: ${pct}%`}
      >
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
