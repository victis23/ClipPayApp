'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '@/lib/firebase/client'
import { campaignConverter } from '@/lib/firebase/converters'
import { useAuthStore } from '@/lib/store/authStore'
import { useCampaignClips } from '@/lib/hooks/useClips'
import { CampaignDoc, CampaignStatus } from '@/lib/types'
import { TopNav } from '@/components/shared/TopNav'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PlatformTagGroup } from '@/components/shared/PlatformTag'
import { CapProgressBar } from '@/components/brand/CapProgressBar'
import { FTCNotice } from '@/components/shared/FTCNotice'
import { ClipRow } from '@/components/clipper/ClipRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatViews } from '@/lib/utils/format'
import { auth } from '@/lib/firebase/client'

const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  active:  ['paused', 'ended'],
  paused:  ['active', 'ended'],
  capped:  ['ended'],
  ended:   [],
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { clips, loading: clipsLoading } = useCampaignClips(id)
  const [campaign, setCampaign] = useState<CampaignDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    const ref = doc(db, 'campaigns', id).withConverter(campaignConverter)
    getDoc(ref).then((snap) => {
      if (snap.exists()) setCampaign(snap.data())
      setLoading(false)
    })
  }, [id])

  const changeStatus = async (newStatus: CampaignStatus) => {
    if (!campaign || !user) return
    setUpdating(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        toast.error(json.error ?? 'Failed to update status')
        return
      }
      setCampaign((prev) => prev ? { ...prev, status: newStatus } : prev)
      toast.success(`Campaign ${newStatus}`)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 bg-cn-border rounded w-1/3" />
        <div className="h-32 bg-cn-border rounded" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <p className="text-cn-muted">Campaign not found.</p>
      </div>
    )
  }

  const transitions = ALLOWED_TRANSITIONS[campaign.status]

  return (
    <>
      <TopNav title={campaign.creatorName} />
      <div className="p-4 md:p-6 space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-cn-text">{campaign.creatorName}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <PlatformTagGroup platforms={campaign.platforms} />
          </div>
          {transitions.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {transitions.map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  disabled={updating}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-cn-border hover:bg-cn-surface transition-colors capitalize disabled:opacity-50"
                >
                  {s === 'ended' ? 'End Campaign' : s === 'paused' ? 'Pause' : 'Resume'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'CPM', value: formatCurrency(campaign.cpmRate) },
            { label: 'Total Views', value: formatViews(campaign.totalViews) },
            { label: 'Clippers', value: campaign.clippersCount.toString() },
            { label: 'Total Clips', value: campaign.totalClips.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-cn-border p-4">
              <p className="text-xs text-cn-muted font-medium">{label}</p>
              <p className="text-xl font-bold text-cn-text mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <CapProgressBar paidOut={campaign.paidOut} campaignCap={campaign.campaignCap} />
        <FTCNotice ftcLabel={campaign.ftcLabel} />

        {/* Clips table */}
        <div className="bg-white rounded-xl border border-cn-border shadow-sm overflow-x-auto">
          <div className="p-4 border-b border-cn-border">
            <h2 className="font-semibold text-cn-text">Submitted Clips</h2>
          </div>
          {clipsLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-cn-border rounded" />
              ))}
            </div>
          ) : clips.length === 0 ? (
            <EmptyState title="No clips yet" description="Clippers haven't submitted any clips yet." />
          ) : (
            <table className="w-full text-sm" aria-label="Campaign clips">
              <thead>
                <tr className="border-b border-cn-border bg-cn-surface text-left">
                  {['Campaign', 'Platform', 'Views', 'Earned', 'Status', 'Date', 'FTC', ''].map((h) => (
                    <th key={h} className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clips.map((clip) => (
                  <ClipRow key={clip.id} clip={clip} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
