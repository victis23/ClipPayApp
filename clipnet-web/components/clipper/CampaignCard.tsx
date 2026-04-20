import Link from 'next/link'
import { CampaignDoc, ACCENT_COLORS } from '@/lib/types'
import { PlatformTagGroup } from '@/components/shared/PlatformTag'
import { CapProgressBar } from '@/components/brand/CapProgressBar'
import { formatCurrency, formatViews } from '@/lib/utils/format'

interface CampaignCardProps {
  campaign: CampaignDoc
}

const ACCENT_HEX: Record<string, string> = {
  'cn-amber':   'var(--cn-amber)',
  'cn-teal':    'var(--cn-teal)',
  'cn-purple':  'var(--cn-purple)',
  'cn-blue':    'var(--cn-blue)',
  'cn-pink':    'var(--cn-pink)',
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const accentKey = ACCENT_COLORS[campaign.accentIndex % ACCENT_COLORS.length]
  const accent = ACCENT_HEX[accentKey] ?? 'var(--cn-amber)'

  return (
    <Link
      href={`/browse/${campaign.id}`}
      className="block bg-white rounded-xl border border-cn-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      aria-label={`Campaign: ${campaign.creatorName} — ${formatCurrency(campaign.cpmRate)} CPM`}
    >
      {/* Accent stripe */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-cn-text text-base leading-tight">{campaign.creatorName}</p>
          {campaign.bounty && (
            <span className="shrink-0 text-xs font-semibold text-cn-amber bg-cn-amber/10 rounded-md px-2 py-0.5">
              Bounty
            </span>
          )}
        </div>

        <PlatformTagGroup platforms={campaign.platforms} />

        <div className="flex items-center gap-4 text-sm text-cn-muted">
          <span>
            <span className="font-semibold text-cn-text">{formatCurrency(campaign.cpmRate)}</span> CPM
          </span>
          <span>
            <span className="font-semibold text-cn-text">{formatViews(campaign.totalViews)}</span> views
          </span>
          <span>
            <span className="font-semibold text-cn-text">{campaign.totalClips}</span> clips
          </span>
        </div>

        <CapProgressBar paidOut={campaign.paidOut} campaignCap={campaign.campaignCap} />

        {campaign.bounty && (
          <p className="text-xs text-cn-amber font-medium">
            +{formatCurrency(campaign.bounty.payoutAmount)} bonus at {formatViews(campaign.bounty.thresholdViews)} views
          </p>
        )}
      </div>
    </Link>
  )
}
