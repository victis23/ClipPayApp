import { formatCurrency } from '@/lib/utils/format'

interface EarningsSummaryCardProps {
  totalEarned: number
  pendingEarnings: number
  loading?: boolean
}

export function EarningsSummaryCard({ totalEarned, pendingEarnings, loading }: EarningsSummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-cn-navy rounded-xl p-6 animate-pulse h-32" />
    )
  }

  return (
    <div className="bg-cn-navy rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-6">
      <div>
        <p className="text-sm text-white/60 font-medium">Total Earned</p>
        <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalEarned)}</p>
      </div>
      <div className="sm:border-l sm:border-white/20 sm:pl-6">
        <p className="text-sm text-white/60 font-medium">Pending Payout</p>
        <p className="text-3xl font-bold text-cn-amber mt-1">{formatCurrency(pendingEarnings)}</p>
        {pendingEarnings < 50 && (
          <p className="text-xs text-white/40 mt-1">
            {formatCurrency(50 - pendingEarnings)} more until payout eligible
          </p>
        )}
      </div>
    </div>
  )
}
