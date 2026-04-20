'use client'

import { useEffect, useState } from 'react'
import { TopNav } from '@/components/shared/TopNav'
import { CampaignCardGrid } from '@/components/clipper/CampaignCardGrid'
import { PlatformFilterBar } from '@/components/clipper/PlatformFilterBar'
import { fetchActiveCampaigns } from '@/lib/hooks/useCampaigns'
import { CampaignDoc, Platform } from '@/lib/types'

type SortOption = 'newest' | 'cpm_desc' | 'views_desc'

export default function BrowsePage() {
  const [all, setAll]           = useState<CampaignDoc[]>([])
  const [loading, setLoading]   = useState(true)
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [search, setSearch]     = useState('')
  const [sort, setSort]         = useState<SortOption>('newest')

  useEffect(() => {
    fetchActiveCampaigns()
      .then(setAll)
      .finally(() => setLoading(false))
  }, [])

  const filtered = all
    .filter((c) => !platform || c.platforms.includes(platform))
    .filter((c) => !search || c.creatorName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'cpm_desc')   return b.cpmRate - a.cpmRate
      if (sort === 'views_desc') return b.totalViews - a.totalViews
      return b.createdAt.seconds - a.createdAt.seconds
    })

  return (
    <>
      <TopNav title="Browse Campaigns" />
      <div className="p-4 md:p-6 space-y-5 flex-1">
        <h1 className="text-lg font-semibold text-cn-text">Browse Campaigns</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creator…"
            aria-label="Search campaigns"
            className="rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber w-full sm:w-56 bg-white"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort campaigns"
            className="rounded-lg border border-cn-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cn-amber"
          >
            <option value="newest">Newest</option>
            <option value="cpm_desc">Highest CPM</option>
            <option value="views_desc">Most Views</option>
          </select>
        </div>

        <PlatformFilterBar selected={platform} onChange={setPlatform} />
        <CampaignCardGrid campaigns={filtered} loading={loading} />
      </div>
    </>
  )
}
