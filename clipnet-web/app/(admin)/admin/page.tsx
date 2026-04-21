'use client'

import { useCallback, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase/client'
import { ClipDoc, ClipStatus, Platform } from '@/lib/types'

/* ─── helpers ────────────────────────────────────────────────────── */

const STATUS_TABS: { value: ClipStatus; label: string }[] = [
  { value: 'pending',  label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  tiktok: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.97a8.16 8.16 0 004.77 1.52V7.04a4.85 4.85 0 01-1-.35z"/>
    </svg>
  ),
  instagram: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  youtube: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
}

const PLATFORM_COLORS: Record<Platform, string> = {
  tiktok:    'text-white bg-neutral-900',
  instagram: 'text-white bg-gradient-to-br from-purple-500 to-pink-500',
  youtube:   'text-white bg-red-600',
  x:         'text-white bg-neutral-800',
}

function formatDate(ts: { seconds: number } | null | undefined): string {
  if (!ts) return '—'
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
    hour:  '2-digit',
    minute:'2-digit',
  })
}

/* ─── Reject modal ────────────────────────────────────────────────── */

interface RejectModalProps {
  clip: ClipDoc
  onConfirm: (reason: string) => void
  onCancel:  () => void
  loading:   boolean
}

function RejectModal({ clip, onConfirm, onCancel, loading }: RejectModalProps) {
  const [reason, setReason] = useState('')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 id="reject-modal-title" className="text-lg font-semibold text-cn-navy mb-1">
          Reject clip
        </h2>
        <p className="text-sm text-cn-muted mb-4">
          By <span className="font-medium text-cn-text">{clip.clipperDisplayName}</span> for{' '}
          <span className="font-medium text-cn-text">{clip.creatorName}</span>
        </p>

        <label htmlFor="reject-reason" className="block text-sm font-medium text-cn-text mb-1">
          Reason <span className="text-cn-danger">*</span>
        </label>
        <textarea
          id="reject-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. No FTC disclosure visible, duplicate submission, off-topic content…"
          className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cn-danger"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-lg border border-cn-border text-sm font-medium text-cn-text hover:bg-cn-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || reason.trim().length === 0}
            className="flex-1 py-2 rounded-lg bg-cn-danger text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Rejecting…' : 'Confirm reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Clip card ───────────────────────────────────────────────────── */

interface ClipCardProps {
  clip:     ClipDoc
  onApprove: (clip: ClipDoc) => void
  onReject:  (clip: ClipDoc) => void
  busy:      boolean
}

function ClipCard({ clip, onApprove, onReject, busy }: ClipCardProps) {
  const isPending = clip.status === 'pending'

  return (
    <div className="bg-white rounded-xl border border-cn-border p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-cn-navy text-sm truncate">{clip.creatorName}</p>
          <p className="text-xs text-cn-muted mt-0.5">
            by <span className="text-cn-text font-medium">{clip.clipperDisplayName}</span>
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${PLATFORM_COLORS[clip.platform]}`}
        >
          {PLATFORM_ICONS[clip.platform]}
          {clip.platform.charAt(0).toUpperCase() + clip.platform.slice(1)}
        </span>
      </div>

      {/* Clip URL */}
      <a
        href={clip.clipUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg border border-cn-border bg-cn-surface px-3 py-2 text-xs text-cn-amber font-medium hover:bg-amber-50 transition-colors truncate"
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span className="truncate">{clip.clipUrl}</span>
      </a>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-xs text-cn-muted">
        <div>
          <p className="font-medium text-cn-text">FTC Label</p>
          <p className="mt-0.5">{clip.ftcLabel}</p>
        </div>
        <div>
          <p className="font-medium text-cn-text">Submitted</p>
          <p className="mt-0.5">{formatDate(clip.submittedAt as { seconds: number } | null)}</p>
        </div>
        <div>
          <p className="font-medium text-cn-text">Campaign ID</p>
          <p className="mt-0.5 font-mono text-[10px] truncate">{clip.campaignId}</p>
        </div>
        <div>
          <p className="font-medium text-cn-text">Clip ID</p>
          <p className="mt-0.5 font-mono text-[10px] truncate">{clip.id}</p>
        </div>
      </div>

      {/* Rejected reason (if applicable) */}
      {clip.status === 'rejected' && clip.rejectedReason && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-xs font-medium text-red-700 mb-0.5">Rejection reason</p>
          <p className="text-xs text-red-600">{clip.rejectedReason}</p>
        </div>
      )}

      {/* Actions — only for pending */}
      {isPending && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onApprove(clip)}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            onClick={() => onReject(clip)}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-cn-danger text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────────── */

export default function AdminClipQueuePage() {
  const [activeTab, setActiveTab]         = useState<ClipStatus>('pending')
  const [clips, setClips]                 = useState<ClipDoc[]>([])
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [toast, setToast]                 = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [rejectTarget, setRejectTarget]   = useState<ClipDoc | null>(null)

  /* ── fetch clips ── */
  const fetchClips = useCallback(async (status: ClipStatus) => {
    setLoading(true)
    setError(null)
    try {
      const idToken = await auth.currentUser?.getIdToken()
      const res = await fetch(`/api/admin/clips?status=${status}&limit=100`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load clips')
      setClips(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClips(activeTab)
  }, [activeTab, fetchClips])

  /* ── toast helper ── */
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── approve ── */
  const handleApprove = async (clip: ClipDoc) => {
    setActionLoading(true)
    try {
      const idToken = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/admin/clips', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body:    JSON.stringify({ clipId: clip.id, action: 'approve' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Approve failed')
      setClips((prev) => prev.filter((c) => c.id !== clip.id))
      showToast(`✓ Clip approved — ${clip.clipperDisplayName}`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Approve failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  /* ── reject (with reason) ── */
  const handleReject = async (clip: ClipDoc, reason: string) => {
    setActionLoading(true)
    try {
      const idToken = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/admin/clips', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body:    JSON.stringify({ clipId: clip.id, action: 'reject', rejectedReason: reason }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Reject failed')
      setClips((prev) => prev.filter((c) => c.id !== clip.id))
      setRejectTarget(null)
      showToast(`✗ Clip rejected — ${clip.clipperDisplayName}`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Reject failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const pendingCount = activeTab === 'pending' ? clips.length : undefined

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-cn-danger text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          clip={rejectTarget}
          onConfirm={(reason) => handleReject(rejectTarget, reason)}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Page content */}
      <div className="flex-1 bg-cn-surface p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cn-navy">Clip Review Queue</h1>
          <p className="text-sm text-cn-muted mt-1">
            Review submitted clips before they enter the view-polling cycle.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white rounded-xl border border-cn-border w-fit mb-6">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === value
                  ? 'bg-cn-navy text-white shadow-sm'
                  : 'text-cn-muted hover:text-cn-text'
              }`}
            >
              {label}
              {value === 'pending' && pendingCount !== undefined && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-cn-amber text-cn-navy text-[10px] font-bold">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-cn-amber border-t-transparent animate-spin" aria-label="Loading clips" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            {error}
            <button
              onClick={() => fetchClips(activeTab)}
              className="ml-3 underline font-medium hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && clips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg
              className="w-12 h-12 text-cn-border mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-cn-muted text-sm">
              {activeTab === 'pending'
                ? 'No clips waiting for review — you\'re all caught up!'
                : `No ${activeTab} clips yet.`}
            </p>
          </div>
        )}

        {!loading && !error && clips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {clips.map((clip) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                onApprove={handleApprove}
                onReject={(c) => setRejectTarget(c)}
                busy={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
