'use client'

import { TopNav } from '@/components/shared/TopNav'
import { useAuthStore } from '@/lib/store/authStore'

export default function BrandSettingsPage() {
  const { profile } = useAuthStore()

  return (
    <>
      <TopNav title="Settings" />
      <div className="p-4 md:p-6 space-y-6 flex-1">
        <h1 className="text-lg font-semibold text-cn-text">Account Settings</h1>
        <div className="bg-white rounded-xl border border-cn-border shadow-sm p-6 max-w-lg space-y-4">
          <div>
            <p className="text-sm font-medium text-cn-muted">Display Name</p>
            <p className="text-base text-cn-text font-medium mt-0.5">{profile?.displayName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-cn-muted">Email</p>
            <p className="text-base text-cn-text font-medium mt-0.5">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-cn-muted">Role</p>
            <p className="text-base text-cn-text font-medium mt-0.5 capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>
    </>
  )
}
