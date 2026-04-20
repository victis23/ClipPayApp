'use client'

import { TopNav } from '@/components/shared/TopNav'
import { ClipRow } from '@/components/clipper/ClipRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { useClips } from '@/lib/hooks/useClips'

export default function ClipsPage() {
  const { clips, loading } = useClips()

  return (
    <>
      <TopNav title="My Clips" />
      <div className="p-4 md:p-6 space-y-5 flex-1">
        <h1 className="text-lg font-semibold text-cn-text">My Clips</h1>

        <div className="bg-white rounded-xl border border-cn-border shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-cn-border rounded" />
              ))}
            </div>
          ) : clips.length === 0 ? (
            <EmptyState
              title="No clips yet"
              description="Browse campaigns and submit your first clip to start earning."
            />
          ) : (
            <table className="w-full text-sm" aria-label="My clips">
              <thead>
                <tr className="border-b border-cn-border bg-cn-surface text-left">
                  {['Campaign', 'Platform', 'Views', 'Earned', 'Status', 'Date', 'FTC', ''].map((h) => (
                    <th key={h} className="py-3 px-4 font-semibold text-cn-text text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clips.map((clip) => (
                  <ClipRow key={clip.id} clip={clip} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
