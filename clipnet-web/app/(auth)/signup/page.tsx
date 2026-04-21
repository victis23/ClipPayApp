'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserWithEmailAndPassword } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import { SignupSchema, SignupInput } from '@/lib/utils/validators'

const AUTH_ERROR_MAP: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/weak-password':         'Password must be at least 6 characters',
}

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const defaultRole = roleParam === 'brand' ? 'brand' : 'clipper'

  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError]   = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { role: defaultRole },
  })

  const selectedRole = watch('role')

  const onSubmit = async ({ email, password, displayName, role }: SignupInput) => {
    setSubmitting(true)
    setAuthError(null)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:         cred.user.uid,
        role,
        displayName,
        email,
        ftcLabel:    '#ad',
        createdAt:   serverTimestamp(),
        updatedAt:   serverTimestamp(),
        ...(role === 'clipper' ? { totalEarned: 0, pendingEarnings: 0 } : {}),
        ...(role === 'brand'   ? { totalCampaignSpend: 0 }              : {}),
      })
      router.replace(role === 'brand' ? '/dashboard' : '/browse')
    } catch (err) {
      console.error('Signup error:', err)
      if (err instanceof FirebaseError) {
        setAuthError(AUTH_ERROR_MAP[err.code] ?? `Firebase error: ${err.code}`)
      } else {
        setAuthError(`Error: ${err instanceof Error ? err.message : String(err)}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cn-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-cn-navy">
            Clip<span className="text-cn-amber">Net</span>
          </Link>
          <p className="text-cn-muted text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-cn-border shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Role selector */}
            <div>
              <p className="text-sm font-medium text-cn-text mb-2">I am a…</p>
              <div className="grid grid-cols-2 gap-2">
                {(['brand', 'clipper'] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRole === r
                        ? 'border-cn-amber bg-cn-amber/5'
                        : 'border-cn-border hover:border-cn-amber/50'
                    }`}
                  >
                    <input type="radio" value={r} {...register('role')} className="sr-only" />
                    <span className="text-sm font-semibold capitalize text-cn-text">{r}</span>
                    <span className="text-xs text-cn-muted text-center">
                      {r === 'brand' ? 'Launch campaigns' : 'Submit clips & earn'}
                    </span>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p role="alert" className="text-xs text-cn-danger mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-cn-text mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                {...register('displayName')}
                className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
              />
              {errors.displayName && (
                <p role="alert" className="text-xs text-cn-danger mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cn-text mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
              />
              {errors.email && (
                <p role="alert" className="text-xs text-cn-danger mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cn-text mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="w-full rounded-lg border border-cn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cn-amber"
              />
              {errors.password && (
                <p role="alert" className="text-xs text-cn-danger mt-1">{errors.password.message}</p>
              )}
            </div>

            {authError && (
              <p role="alert" className="text-sm text-cn-danger">{authError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-cn-navy bg-cn-amber hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-cn-muted mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-cn-amber font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
