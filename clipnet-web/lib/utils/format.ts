import { Timestamp } from 'firebase/firestore'

export function formatViews(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`
}

export function formatShortCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`
}

export function capFraction(paid: number, cap: number): number {
  if (cap <= 0) return 0
  return Math.min(1, Math.max(0, paid / cap))
}

export function formatDate(ts: Timestamp): string {
  const date = ts.toDate()
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
