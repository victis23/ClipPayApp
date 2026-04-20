'use client'

import { TopNav } from '@/components/shared/TopNav'
import { CampaignStatsGrid } from '@/components/brand/CampaignStatsGrid'
import { useCampaigns } from '@/lib/hooks/useCampaigns'

export default function AnalyticsPage() {
  const { campaigns, loading } = useCampaigns()

  return (
    <>
      <TopNav title="Analytics" />
      <div className="p-4 md:p-6 space-y-6 flex-1">
        <h1 className="text-lg font-semibold text-cn-text">Analytics</h1>
        <CampaignStatsGrid campaigns={campaigns} />
        {loading && (
          <div className="text-sm text-cn-muted">Loading campaign data…</div>
        )}
      </div>
    </>
  )
}
