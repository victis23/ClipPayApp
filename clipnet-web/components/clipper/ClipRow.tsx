import { ClipDoc } from '@/lib/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PlatformTag } from '@/components/shared/PlatformTag'
import { formatViews, formatCurrency, formatDate } from '@/lib/utils/format'

interface ClipRowProps {
  clip: ClipDoc
}

export function ClipRow({ clip }: ClipRowProps) {
  return (
    <tr className="border-b border-cn-border hover:bg-cn-surface transition-colors">
      <td className="py-3 px-4 text-sm text-cn-text font-medium">{clip.creatorName}</td>
      <td className="py-3 px-4">
        <PlatformTag platform={clip.platform} />
      </td>
      <td className="py-3 px-4 text-sm text-cn-text">{formatViews(clip.views)}</td>
      <td className="py-3 px-4 text-sm font-semibold text-cn-text">
        {formatCurrency(clip.earnedAmount)}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={clip.status} />
        {clip.status === 'verified' || clip.status === 'paid' ? null : null}
      </td>
      <td className="py-3 px-4 text-xs text-cn-muted">{formatDate(clip.submittedAt)}</td>
      <td className="py-3 px-4">
        <span
          className="inline-flex items-center rounded-md bg-cn-teal/10 text-cn-teal px-2 py-0.5 text-xs font-medium"
          aria-label={`FTC label: ${clip.ftcLabel}`}
        >
          {clip.ftcLabel}
        </span>
      </td>
      <td className="py-3 px-4">
        <a
          href={clip.clipUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View clip on ${clip.platform}`}
          className="text-xs font-medium text-cn-amber hover:underline"
        >
          View
        </a>
      </td>
    </tr>
  )
}
