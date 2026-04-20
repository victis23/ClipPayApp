import { CampaignStatus, ClipStatus, ApplicationStatus, PayoutStatus } from '@/lib/types'

type AnyStatus = CampaignStatus | ClipStatus | ApplicationStatus | PayoutStatus

const STATUS_STYLES: Record<string, string> = {
  active:     'bg-cn-success/15 text-cn-success',
  paused:     'bg-cn-amber/15 text-cn-amber',
  capped:     'bg-cn-purple/15 text-cn-purple',
  ended:      'bg-cn-muted/20 text-cn-muted',
  pending:    'bg-cn-blue/15 text-cn-blue',
  verified:   'bg-cn-teal/15 text-cn-teal',
  paid:       'bg-cn-success/15 text-cn-success',
  rejected:   'bg-cn-danger/15 text-cn-danger',
  approved:   'bg-cn-success/15 text-cn-success',
  processing: 'bg-cn-amber/15 text-cn-amber',
  completed:  'bg-cn-success/15 text-cn-success',
  failed:     'bg-cn-danger/15 text-cn-danger',
}

interface StatusBadgeProps {
  status: AnyStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? 'bg-cn-muted/20 text-cn-muted'
  return (
    <span
      aria-label={`Status: ${status}`}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles} ${className}`}
    >
      {status}
    </span>
  )
}
