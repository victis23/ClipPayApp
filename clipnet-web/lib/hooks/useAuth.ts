'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/client'
import { userConverter } from '../firebase/converters'
import { useAuthStore } from '../store/authStore'
import { AppRole } from '../types'

export function useAuthListener() {
  const { setUser, setProfile, setLoading, reset } = useAuthStore()

  useEffect(() => {
    let profileUnsub: (() => void) | null = null

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (profileUnsub) {
        profileUnsub()
        profileUnsub = null
      }

      if (!firebaseUser) {
        reset()
        return
      }

      setUser(firebaseUser)
      setLoading(true)

      const profileRef = doc(db, 'users', firebaseUser.uid).withConverter(userConverter)
      profileUnsub = onSnapshot(
        profileRef,
        (snap) => {
          setProfile(snap.exists() ? snap.data() : null)
          setLoading(false)
        },
        () => {
          setProfile(null)
          setLoading(false)
        }
      )
    })

    return () => {
      authUnsub()
      if (profileUnsub) profileUnsub()
    }
  }, [setUser, setProfile, setLoading, reset])
}

export function useRequireAuth(requiredRole?: AppRole) {
  const { user, profile, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
      router.replace('/login')
    }
  }, [user, profile, loading, requiredRole, router])

  return { user, profile, loading }
}
