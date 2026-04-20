'use client'

import { TopNav } from '@/components/shared/TopNav'
import { useAuthStore } from '@/lib/store/authStore'

export default function AccountPage() {
  const { profile } = useAuthStore()

  return (
    <>
      <TopNav title="Account" />
      <div className="p-4 md:p-6 space-y-6 flex-1">
        <h1 className="text-lg font-semibold text-cn-text">Account</h1>
        <div className="bg-white rounded-xl border border-cn-border shadow-sm p-6 max-w-lg space-y-5">
          <div>
            <p className="text-sm font-medium text-cn-muted">Display Name</p>
            <p className="text-base text-cn-text font-medium mt-0.5">{profile?.displayName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-cn-muted">Email</p>
            <p className="text-base text-cn-text font-medium mt-0.5">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-cn-muted">FTC Label</p>
            <p className="text-base text-cn-text font-medium mt-0.5">{profile?.ftcLabel ?? '#ad'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-cn-muted">Stripe Payout</p>
            {profile?.stripeAccountId ? (
              <p className="text-sm text-cn-success font-medium mt-0.5">Connected ✓</p>
            ) : (
              <p className="text-sm text-cn-muted mt-0.5">Not connected — payouts unavailable</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
