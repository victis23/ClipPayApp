import { CampaignDoc } from '@/lib/types'
import { StatCard } from '@/components/shared/StatCard'
import { formatViews, formatShortCurrency } from '@/lib/utils/format'

interface CampaignStatsGridProps {
  campaigns: CampaignDoc[]
}

export function CampaignStatsGrid({ campaigns }: CampaignStatsGridProps) {
  const totalViews  = campaigns.reduce((s, c) => s + c.totalViews, 0)
  const totalPaid   = campaigns.reduce((s, c) => s + c.paidOut, 0)
  const activeCount = campaigns.filter((c) => c.status === 'active').length
  const totalClips  = campaigns.reduce((s, c) => s + c.totalClips, 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Views"
        value={formatViews(totalViews)}
        accent="var(--cn-teal)"
      />
      <StatCard
        label="Total Paid Out"
        value={formatShortCurrency(totalPaid)}
        accent="var(--cn-amber)"
      />
      <StatCard
        label="Active Campaigns"
        value={activeCount.toString()}
        accent="var(--cn-success)"
      />
      <StatCard
        label="Total Clips"
        value={totalClips.toString()}
        accent="var(--cn-purple)"
      />
    </div>
  )
}
