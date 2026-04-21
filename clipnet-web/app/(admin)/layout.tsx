'use client'

import { useRequireAuth } from '@/lib/hooks/useAuth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, profile } = useRequireAuth('admin')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cn-amber border-t-transparent animate-spin" aria-label="Loading" />
      </div>
    )
  }

  // useRequireAuth redirects if role !== admin, but guard render too
  if (profile?.role !== 'admin') return null

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
