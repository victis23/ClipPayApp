'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { campaignConverter } from '@/lib/firebase/converters'
import { CampaignDoc } from '@/lib/types'
import { TopNav } from '@/components/shared/TopNav'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PlatformTagGroup } from '@/components/shared/PlatformTag'
import { CapProgressBar } from '@/components/brand/CapProgressBar'
import { FTCNotice } from '@/components/shared/FTCNotice'
import { ClipSubmitModal } from '@/components/clipper/ClipSubmitModal'
import { formatCurrency, formatViews } from '@/lib/utils/format'

export default function CampaignApplyPage() {
  const { id } = useParams<{ id: string }>()
  const [campaign, setCampaign] = useState<CampaignDoc | null>(null)
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    const ref = doc(db, 'campaigns', id).withConverter(campaignConverter)
    getDoc(ref).then((snap) => {
      if (snap.exists()) setCampaign(snap.data())
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 bg-cn-border rounded w-1/3" />
        <div className="h-40 bg-cn-border rounded" />
      </div>
    )
  }

  if (!campaign || campaign.status !== 'active') {
    return (
      <div className="p-6">
        <p className="text-cn-muted">Campaign not available.</p>
      </div>
    )
  }

  return (
    <>
      <TopNav title={campaign.creatorName} />
      <div className="p-4 md:p-6 space-y-6 flex-1 max-w-2xl">
        <div className="flex items-start gap-4 justify-between flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-cn-text">{campaign.creatorName}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <PlatformTagGroup platforms={campaign.platforms} />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-cn-amber text-cn-navy font-semibold text-sm hover:bg-amber-400 transition-colors"
          >
            Submit a Clip
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'CPM Rate',     value: `${formatCurrency(campaign.cpmRate)} / 1K views` },
            { label: 'Total Views',  value: formatViews(campaign.totalViews) },
            { label: 'Clips',        value: campaign.totalClips.toString() },
            { label: 'Clippers',     value: campaign.clippersCount.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-cn-border p-4">
              <p className="text-xs text-cn-muted font-medium">{label}</p>
              <p className="text-lg font-bold text-cn-text mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <CapProgressBar paidOut={campaign.paidOut} campaignCap={campaign.campaignCap} />

        {campaign.bounty && (
          <div className="bg-cn-amber/10 border border-cn-amber/30 rounded-xl p-4">
            <p className="font-semibold text-cn-text">
              🏆 Bounty: +{formatCurrency(campaign.bounty.payoutAmount)} at {formatViews(campaign.bounty.thresholdViews)} views
            </p>
          </div>
        )}

        <FTCNotice ftcLabel={campaign.ftcLabel} />
      </div>

      <ClipSubmitModal
        open={modalOpen}
        campaign={campaign}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
