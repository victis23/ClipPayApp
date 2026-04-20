'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { TopNav } from '@/components/shared/TopNav'
import { EarningsSummaryCard } from '@/components/clipper/EarningsSummaryCard'
import { ClipRow } from '@/components/clipper/ClipRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { useEarnings } from '@/lib/hooks/useEarnings'
import { useClips } from '@/lib/hooks/useClips'
import { useAuthStore } from '@/lib/store/authStore'
import { auth } from '@/lib/firebase/client'

export default function EarningsPage() {
  const { profile } = useAuthStore()
  const { totalEarned, pendingEarnings, loading: earningsLoading } = useEarnings()
  const { clips, loading: clipsLoading } = useClips()
  const [paying, setPaying] = useState(false)

  const paidClips = clips.filter((c) => c.status === 'paid')
  const pendingClips = clips.filter((c) => c.status === 'verified')

  const handlePayout = async () => {
    if (!profile?.stripeAccountId) {
      toast.error('Connect your Stripe account in Account settings first.')
      return
    }
    if (pendingEarnings < 50) {
      toast.error('Minimum payout is $50.')
      return
    }
    setPaying(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method: 'stripe' }),
      })
      const json = await res.json() as { error?: string }
      if (!res.ok) {
        toast.error(json.error ?? 'Payout failed')
        return
      }
      toast.success('Payout initiated! Funds typically arrive in 2–3 business days.')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <>
      <TopNav title="Earnings" />
      <div className="p-4 md:p-6 space-y-6 flex-1">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-lg font-semibold text-cn-text">Earnings</h1>
          <button
            onClick={handlePayout}
            disabled={paying || pendingEarnings < 50}
            className="px-4 py-2 rounded-lg bg-cn-amber text-cn-navy text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {paying ? 'Processing…' : 'Request Payout'}
          </button>
        </div>

        <EarningsSummaryCard
          totalEarned={totalEarned}
          pendingEarnings={pendingEarnings}
          loading={earningsLoading}
        />

        {/* Verified / ready to pay clips */}
        {pendingClips.length > 0 && (
          <div className="bg-white rounded-xl border border-cn-border shadow-sm overflow-x-auto">
            <div className="p-4 border-b border-cn-border">
              <h2 className="font-semibold text-cn-text">Ready for Payout</h2>
            </div>
            <table className="w-full text-sm" aria-label="Clips ready for payout">
              <thead>
                <tr className="border-b border-cn-border bg-cn-surface text-left">
                  {['Campaign', 'Platform', 'Views', 'Earned', 'Status', 'Date', 'FTC', ''].map((h) => (
                    <th key={h} className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingClips.map((clip) => <ClipRow key={clip.id} clip={clip} />)}
              </tbody>
            </table>
          </div>
        )}

        {/* All clips history */}
        <div className="bg-white rounded-xl border border-cn-border shadow-sm overflow-x-auto">
          <div className="p-4 border-b border-cn-border">
            <h2 className="font-semibold text-cn-text">Clip History</h2>
          </div>
          {clipsLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-cn-border rounded" />)}
            </div>
          ) : clips.length === 0 ? (
            <EmptyState title="No clips yet" description="Submit clips to campaigns to start earning." />
          ) : (
            <table className="w-full text-sm" aria-label="Clip history">
              <thead>
                <tr className="border-b border-cn-border bg-cn-surface text-left">
                  {['Campaign', 'Platform', 'Views', 'Earned', 'Status', 'Date', 'FTC', ''].map((h) => (
                    <th key={h} className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clips.map((clip) => <ClipRow key={clip.id} clip={clip} />)}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
