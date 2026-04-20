'use client'

import { Platform } from '@/lib/types'

const ALL_PLATFORMS: Platform[] = ['tiktok', 'instagram', 'youtube', 'x']

interface PlatformFilterBarProps {
  selected: Platform | null
  onChange: (p: Platform | null) => void
}

export function PlatformFilterBar({ selected, onChange }: PlatformFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by platform">
      <button
        onClick={() => onChange(null)}
        aria-pressed={selected === null}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
          selected === null
            ? 'bg-cn-navy text-white border-cn-navy'
            : 'bg-white text-cn-text border-cn-border hover:border-cn-navy'
        }`}
      >
        All
      </button>
      {ALL_PLATFORMS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-pressed={selected === p}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
            selected === p
              ? 'bg-cn-navy text-white border-cn-navy'
              : 'bg-white text-cn-text border-cn-border hover:border-cn-navy'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
