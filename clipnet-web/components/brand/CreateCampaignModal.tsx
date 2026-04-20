'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/lib/store/authStore'
import { CreateCampaignSchema, CreateCampaignInput } from '@/lib/utils/validators'
import { Platform } from '@/lib/types'
import { auth } from '@/lib/firebase/client'

interface CreateCampaignModalProps {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const PLATFORMS: Platform[] = ['tiktok', 'instagram', 'youtube', 'x']

export function CreateCampaignModal({ open, onClose, onCreated }: CreateCampaignModalProps) {
  const { user } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: {
      platforms: [] as CreateCampaignInput['platforms'],
      ftcLabel:  '#ad',
      creatorName: '',
      cpmRate: 0,
      campaignCap: 0,
      minimumPayoutViews: 0,
    },
  })

  const selectedPlatforms = watch('platforms') ?? []

  const togglePlatform = (p: Platform) => {
    const current = selectedPlatforms
    setValue(
      'platforms',
      current.includes(p) ? current.filter((x) => x !== p) : [...current, p]
    )
  }

  const onSubmit = async (data: CreateCampaignInput) => {
    if (!user) return
    setSubmitting(true)
    setServerError(null)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      const json = await res.json() as { data: unknown; error?: string }
      if (!res.ok) {
        setServerError(json.error ?? 'Failed to create campaign')
        return
      }
      reset()
      onCreated?.()
      onClose()
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-campaign-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-cn-border">
          <h2 id="create-campaign-title" className="text-lg font-semibold text-cn-text">
            Launch Campaign
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-cn-muted hover:text-cn-text transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="creatorName" className="block text-sm font-medium text-cn-text mb-1">
              Creator / Brand Name
            </label>
            <input
              id="creatorName"
              {...register('creatorName')}
              className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
              placeholder="e.g. Pirate Software"
            />
            {errors.creatorName && (
              <p role="alert" className="text-xs text-cn-danger mt-1">{errors.creatorName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cpmRate" className="block text-sm font-medium text-cn-text mb-1">
                CPM Rate ($)
              </label>
              <input
                id="cpmRate"
                type="number"
                step="0.01"
                min="0.01"
                {...register('cpmRate', { valueAsNumber: true })}
                className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
                placeholder="1.00"
              />
              {errors.cpmRate && (
                <p role="alert" className="text-xs text-cn-danger mt-1">{errors.cpmRate.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="campaignCap" className="block text-sm font-medium text-cn-text mb-1">
                Spend Cap ($)
              </label>
              <input
                id="campaignCap"
                type="number"
                step="1"
                min="1"
                {...register('campaignCap', { valueAsNumber: true })}
                className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
                placeholder="10000"
              />
              {errors.campaignCap && (
                <p role="alert" className="text-xs text-cn-danger mt-1">{errors.campaignCap.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="minimumPayoutViews" className="block text-sm font-medium text-cn-text mb-1">
              Minimum Payout Views
            </label>
            <input
              id="minimumPayoutViews"
              type="number"
              step="1"
              min="0"
              {...register('minimumPayoutViews', { valueAsNumber: true })}
              className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
              placeholder="1000"
            />
            {errors.minimumPayoutViews && (
              <p role="alert" className="text-xs text-cn-danger mt-1">{errors.minimumPayoutViews.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="ftcLabel" className="block text-sm font-medium text-cn-text mb-1">
              FTC Label
            </label>
            <input
              id="ftcLabel"
              {...register('ftcLabel')}
              className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
              placeholder="#ad"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-cn-text mb-2">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={selectedPlatforms.includes(p)}
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                    selectedPlatforms.includes(p)
                      ? 'bg-cn-navy text-white border-cn-navy'
                      : 'bg-white text-cn-text border-cn-border hover:border-cn-navy'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {errors.platforms && (
              <p role="alert" className="text-xs text-cn-danger mt-1">{errors.platforms.message}</p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-sm text-cn-danger">{serverError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-cn-text bg-cn-surface rounded-lg hover:bg-cn-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-cn-navy bg-cn-amber rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Launching…' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
