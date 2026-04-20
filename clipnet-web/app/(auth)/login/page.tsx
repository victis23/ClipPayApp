'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { doc, getDoc } from 'firebase/firestore'
import { z } from 'zod'
import { auth, db } from '@/lib/firebase/client'
import { userConverter } from '@/lib/firebase/converters'

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

type LoginInput = z.infer<typeof LoginSchema>

const AUTH_ERROR_MAP: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/wrong-password':        'Incorrect password',
  'auth/invalid-credential':    'Incorrect email or password',
  'auth/user-not-found':        'No account found with this email',
  'auth/too-many-requests':     'Too many attempts. Please try again later.',
}

export default function LoginPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError]   = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) })

  const onSubmit = async ({ email, password }: LoginInput) => {
    setSubmitting(true)
    setAuthError(null)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const userRef = doc(db, 'users', cred.user.uid).withConverter(userConverter)
      const snap = await getDoc(userRef)
      const role = snap.data()?.role
      router.replace(role === 'brand' ? '/dashboard' : '/browse')
    } catch (err) {
      if (err instanceof FirebaseError) {
        setAuthError(AUTH_ERROR_MAP[err.code] ?? 'Something went wrong. Please try again.')
      } else {
        setAuthError('Something went wrong. Please try again.')
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
          <p className="text-cn-muted text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-cn-border shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                autoComplete="current-password"
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
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-cn-muted mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-cn-amber font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
