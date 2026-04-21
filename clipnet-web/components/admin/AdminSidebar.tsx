'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { useAuthStore } from '@/lib/store/authStore'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const ADMIN_NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Clip Queue',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/campaigns',
    label: 'Campaigns',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { profile } = useAuthStore()

  const handleSignOut = async () => {
    await signOut(auth)
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-cn-navy shrink-0">
      <div className="px-5 py-6">
        <span className="text-xl font-bold text-white tracking-tight">
          Clip<span className="text-cn-amber">Net</span>
        </span>
        <span className="ml-2 text-xs font-semibold text-cn-amber/70 uppercase tracking-widest">Admin</span>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 px-3 space-y-1">
        {ADMIN_NAV.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 pb-5 border-t border-white/10 pt-4">
        <p className="text-xs text-white/40 mb-3 truncate">{profile?.email}</p>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
