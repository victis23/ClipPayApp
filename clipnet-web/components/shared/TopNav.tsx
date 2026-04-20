'use client'

import { useAuthStore } from '@/lib/store/authStore'
import { CreatorAvatar } from './CreatorAvatar'

interface TopNavProps {
  title?: string
}

export function TopNav({ title }: TopNavProps) {
  const { profile } = useAuthStore()

  return (
    <header className="h-14 bg-white border-b border-cn-border flex items-center justify-between px-4 md:px-6 shrink-0">
      <p className="font-semibold text-cn-text text-sm md:text-base">{title}</p>

      <div className="flex items-center gap-3">
        {profile && (
          <>
            <span className="hidden sm:block text-sm text-cn-muted">{profile.displayName}</span>
            <CreatorAvatar
              name={profile.displayName}
              avatarUrl={profile.avatarUrl}
              size="sm"
            />
          </>
        )}
      </div>
    </header>
  )
}
