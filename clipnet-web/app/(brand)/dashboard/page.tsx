'use client'

import { useState } from 'react'
import { TopNav } from '@/components/shared/TopNav'
import { CampaignStatsGrid } from '@/components/brand/CampaignStatsGrid'
import { CampaignTable } from '@/components/brand/CampaignTable'
import { CreateCampaignModal } from '@/components/brand/CreateCampaignModal'
import { useCampaigns } from '@/lib/hooks/useCampaigns'

export default function BrandDashboardPage() {
  const { campaigns, loading } = useCampaigns()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <TopNav title="Dashboard" />

      <div className="p-4 md:p-6 space-y-6 flex-1">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold text-cn-text">Overview</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-cn-amber text-cn-navy text-sm font-semibold hover:bg-amber-400 transition-colors"
            aria-label="Launch new campaign"
          >
            + New Campaign
          </button>
        </div>

        <CampaignStatsGrid campaigns={campaigns} />
        <CampaignTable campaigns={campaigns} loading={loading} />
      </div>

      <CreateCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
