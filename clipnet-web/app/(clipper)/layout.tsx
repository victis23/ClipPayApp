'use client'

import { useRequireAuth } from '@/lib/hooks/useAuth'
import { Sidebar } from '@/components/shared/Sidebar'

export default function ClipperLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useRequireAuth('clipper')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cn-amber border-t-transparent animate-spin" aria-label="Loading" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
