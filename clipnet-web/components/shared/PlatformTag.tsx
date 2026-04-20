import { Platform } from '@/lib/types'

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string }> = {
  tiktok:    { label: 'TikTok',    color: 'bg-cn-navy/10 text-cn-navy' },
  instagram: { label: 'Instagram', color: 'bg-cn-pink/15 text-cn-pink' },
  youtube:   { label: 'YouTube',   color: 'bg-cn-danger/15 text-cn-danger' },
  x:         { label: 'X',         color: 'bg-cn-muted/20 text-cn-text' },
}

interface PlatformTagProps {
  platform: Platform
  className?: string
}

export function PlatformTag({ platform, className = '' }: PlatformTagProps) {
  const { label, color } = PLATFORM_CONFIG[platform]
  return (
    <span
      aria-label={label}
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${color} ${className}`}
    >
      {label}
    </span>
  )
}

interface PlatformTagGroupProps {
  platforms: Platform[]
  className?: string
}

export function PlatformTagGroup({ platforms, className = '' }: PlatformTagGroupProps) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {platforms.map((p) => (
        <PlatformTag key={p} platform={p} />
      ))}
    </div>
  )
}
