'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitClipSchema, SubmitClipInput } from '@/lib/utils/validators'
import { CampaignDoc, Platform } from '@/lib/types'
import { auth } from '@/lib/firebase/client'

interface ClipSubmitModalProps {
  open: boolean
  campaign: CampaignDoc
  onClose: () => void
  onSubmitted?: () => void
}

const PLATFORMS: Platform[] = ['tiktok', 'instagram', 'youtube', 'x']

export function ClipSubmitModal({ open, campaign, onClose, onSubmitted }: ClipSubmitModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmitClipInput>({
    resolver: zodResolver(SubmitClipSchema),
    defaultValues: { campaignId: campaign.id },
  })

  const onSubmit = async (data: SubmitClipInput) => {
    setSubmitting(true)
    setServerError(null)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/clips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      const json = await res.json() as { data: unknown; error?: string }
      if (!res.ok) {
        setServerError(json.error ?? 'Failed to submit clip')
        return
      }
      reset()
      onSubmitted?.()
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
      aria-labelledby="submit-clip-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-cn-border">
          <h2 id="submit-clip-title" className="text-lg font-semibold text-cn-text">
            Submit Clip
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-cn-muted hover:text-cn-text transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <input type="hidden" {...register('campaignId')} />

          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-cn-text mb-1">
              Platform
            </label>
            <select
              id="platform"
              {...register('platform')}
              className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cn-amber"
            >
              <option value="">Select platform…</option>
              {PLATFORMS.filter((p) => campaign.platforms.includes(p)).map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
            {errors.platform && (
              <p role="alert" className="text-xs text-cn-danger mt-1">{errors.platform.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="clipUrl" className="block text-sm font-medium text-cn-text mb-1">
              Clip URL
            </label>
            <input
              id="clipUrl"
              type="url"
              {...register('clipUrl')}
              className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
              placeholder="https://www.tiktok.com/@user/video/…"
            />
            {errors.clipUrl && (
              <p role="alert" className="text-xs text-cn-danger mt-1">{errors.clipUrl.message}</p>
            )}
          </div>

          <div className="rounded-lg bg-cn-amber/10 border border-cn-amber/30 p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                aria-required="true"
                {...register('ftcConfirmed', { setValueAs: () => true })}
                className="mt-0.5 accent-cn-amber"
              />
              <span className="text-sm text-cn-text">
                I confirm this clip includes the{' '}
                <span className="font-semibold text-cn-amber">{campaign.ftcLabel}</span> disclosure
                and it is clearly visible in the video.
              </span>
            </label>
            {errors.ftcConfirmed && (
              <p role="alert" className="text-xs text-cn-danger mt-1">{errors.ftcConfirmed.message}</p>
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
              {submitting ? 'Submitting…' : 'Submit Clip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
