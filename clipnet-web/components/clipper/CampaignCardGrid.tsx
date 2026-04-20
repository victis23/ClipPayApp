import { CampaignDoc } from '@/lib/types'
import { CampaignCard } from './CampaignCard'
import { EmptyState } from '@/components/shared/EmptyState'

interface CampaignCardGridProps {
  campaigns: CampaignDoc[]
  loading?: boolean
}

export function CampaignCardGrid({ campaigns, loading }: CampaignCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-52 bg-white rounded-xl border border-cn-border animate-pulse" />
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="No campaigns found"
        description="Try adjusting your filters or check back later for new campaigns."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  )
}
