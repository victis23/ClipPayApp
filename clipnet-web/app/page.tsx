'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { PublicStatsDoc } from '@/lib/types'
import { formatViews, formatShortCurrency } from '@/lib/utils/format'

function usePublicStats() {
  const [stats, setStats] = useState<PublicStatsDoc | null>(null)

  useEffect(() => {
    getDoc(doc(db, 'stats', 'public'))
      .then((snap) => { if (snap.exists()) setStats(snap.data() as PublicStatsDoc) })
      .catch(() => null)
  }, [])

  return stats
}

export default function LandingPage() {
  const stats = usePublicStats()

  return (
    <div className="min-h-screen bg-cn-navy text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <span className="text-xl font-bold">
          Clip<span className="text-cn-amber">Net</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-cn-amber text-cn-navy text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 flex-1">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight">
            The Growth OS for{' '}
            <span className="text-cn-amber">Creators.</span>
          </h1>
          <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
            Launch paid clip campaigns. Clippers submit content. Everyone earns — automatically.
            Replace the Discord chaos with a structured, FTC-compliant marketplace.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?role=brand"
              className="px-8 py-3.5 rounded-xl bg-cn-amber text-cn-navy font-semibold text-base hover:bg-amber-400 transition-colors"
            >
              Launch a Campaign
            </Link>
            <Link
              href="/signup?role=clipper"
              className="px-8 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-base hover:bg-white/5 transition-colors"
            >
              Start Clipping
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats bar */}
      {stats && (
        <section className="border-y border-white/10 py-8">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-cn-amber">{stats.activeCampaigns}</p>
              <p className="text-sm text-white/50 mt-1">Active Campaigns</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cn-teal">{formatViews(stats.totalViews)}</p>
              <p className="text-sm text-white/50 mt-1">Total Views</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cn-success">{formatShortCurrency(stats.totalPaidOut)}</p>
              <p className="text-sm text-white/50 mt-1">Paid to Clippers</p>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <p className="text-cn-amber font-semibold text-sm uppercase tracking-widest mb-6">For Brands</p>
              <ol className="space-y-5">
                {[
                  'Set your CPM rate, spend cap, and target platforms.',
                  'Clippers discover your campaign and submit short clips.',
                  'Views are tracked automatically — you pay only per thousand.',
                  'Campaigns pause automatically when the cap is hit.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="text-cn-amber font-bold text-xl w-6 shrink-0">{i + 1}</span>
                    <p className="text-white/70">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-cn-teal font-semibold text-sm uppercase tracking-widest mb-6">For Clippers</p>
              <ol className="space-y-5">
                {[
                  'Browse active campaigns and find creators you love.',
                  'Submit your clip URL and confirm FTC disclosure.',
                  'Views accumulate — earnings update in real time.',
                  'Request payout via Stripe when you hit $50.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="text-cn-teal font-bold text-xl w-6 shrink-0">{i + 1}</span>
                    <p className="text-white/70">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name:     'Starter',
                price:    'Free',
                rate:     '20% platform rate',
                features: ['Up to 3 campaigns', 'All platforms', 'Stripe payouts', 'FTC tracking'],
                highlight: false,
              },
              {
                name:     'Pro',
                price:    '$149/mo',
                rate:     '12% platform rate',
                features: ['Unlimited campaigns', 'Priority support', 'Analytics export', 'Bounty campaigns'],
                highlight: true,
              },
              {
                name:     'Enterprise',
                price:    'Custom',
                rate:     '8% platform rate',
                features: ['Dedicated CSM', 'API access', 'Custom FTC labels', 'USDT payouts'],
                highlight: false,
              },
            ].map(({ name, price, rate, features, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl p-6 border ${
                  highlight ? 'border-cn-amber bg-cn-amber/5' : 'border-white/10 bg-white/4'
                }`}
              >
                {highlight && (
                  <span className="text-xs font-semibold text-cn-amber uppercase tracking-widest">Most Popular</span>
                )}
                <p className="text-xl font-bold mt-2">{name}</p>
                <p className="text-3xl font-bold mt-1">{price}</p>
                <p className="text-sm text-white/50 mt-0.5">{rate}</p>
                <ul className="mt-5 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <span className="text-cn-success">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    highlight
                      ? 'bg-cn-amber text-cn-navy hover:bg-amber-400'
                      : 'border border-white/20 text-white hover:bg-white/5'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FTC Compliance callout */}
      <section className="py-14 px-4 bg-cn-amber/10 border-t border-cn-amber/20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-cn-amber font-semibold text-sm uppercase tracking-widest mb-3">FTC Compliant</p>
          <h2 className="text-2xl font-bold mb-4">Built-in compliance at every layer</h2>
          <p className="text-white/60">
            Every clip submission requires the clipper to confirm that FTC disclosure labels like{' '}
            <span className="text-cn-amber font-semibold">#ad</span> or{' '}
            <span className="text-cn-amber font-semibold">#sponsored</span> are clearly visible.
            Enforced in the UI, the API, and Firestore security rules simultaneously.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center">
        <p className="text-white/30 text-sm">
          © {new Date().getFullYear()} ClipNet. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
