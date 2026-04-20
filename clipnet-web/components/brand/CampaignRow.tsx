'use client'

import Link from 'next/link'
import { CampaignDoc } from '@/lib/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PlatformTagGroup } from '@/components/shared/PlatformTag'
import { CapProgressBar } from './CapProgressBar'
import { formatViews, formatCurrency } from '@/lib/utils/format'

interface CampaignRowProps {
  campaign: CampaignDoc
}

export function CampaignRow({ campaign }: CampaignRowProps) {
  return (
    <tr className="border-b border-cn-border hover:bg-cn-surface transition-colors">
      <td className="py-3 px-4">
        <Link
          href={`/campaigns/${campaign.id}`}
          className="font-medium text-cn-text hover:text-cn-amber transition-colors"
        >
          {campaign.creatorName}
        </Link>
        <PlatformTagGroup platforms={campaign.platforms} className="mt-1" />
      </td>
      <td className="py-3 px-4 text-sm text-cn-text">
        {formatCurrency(campaign.cpmRate)} CPM
      </td>
      <td className="py-3 px-4 text-sm text-cn-text">
        {formatViews(campaign.totalViews)}
      </td>
      <td className="py-3 px-4 text-sm text-cn-text">
        {campaign.totalClips}
      </td>
      <td className="py-3 px-4 min-w-[160px]">
        <CapProgressBar paidOut={campaign.paidOut} campaignCap={campaign.campaignCap} />
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={campaign.status} />
      </td>
      <td className="py-3 px-4">
        <Link
          href={`/campaigns/${campaign.id}`}
          aria-label={`View campaign ${campaign.creatorName}`}
          className="text-xs font-medium text-cn-amber hover:underline"
        >
          View
        </Link>
      </td>
    </tr>
  )
}
