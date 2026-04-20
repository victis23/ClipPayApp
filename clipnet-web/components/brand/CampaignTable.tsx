import { CampaignDoc } from '@/lib/types'
import { CampaignRow } from './CampaignRow'
import { EmptyState } from '@/components/shared/EmptyState'

interface CampaignTableProps {
  campaigns: CampaignDoc[]
  loading?: boolean
}

export function CampaignTable({ campaigns, loading }: CampaignTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-cn-border shadow-sm p-6">
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-cn-border rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="No campaigns yet"
        description="Launch your first campaign to start getting clips from creators."
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-cn-border shadow-sm overflow-x-auto">
      <table className="w-full text-sm" aria-label="Campaigns">
        <thead>
          <tr className="border-b border-cn-border bg-cn-surface text-left">
            <th className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">Campaign</th>
            <th className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">CPM</th>
            <th className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">Views</th>
            <th className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">Clips</th>
            <th className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">Budget</th>
            <th className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">Status</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <CampaignRow key={c.id} campaign={c} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
