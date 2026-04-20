'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/client'
import { userConverter } from '../firebase/converters'
import { useAuthStore } from '../store/authStore'

interface EarningsState {
  totalEarned: number
  pendingEarnings: number
  loading: boolean
}

export function useEarnings(): EarningsState {
  const { user } = useAuthStore()
  const [state, setState] = useState<EarningsState>({
    totalEarned:     0,
    pendingEarnings: 0,
    loading:         true,
  })

  useEffect(() => {
    if (!user) return

    const ref = doc(db, 'users', user.uid).withConverter(userConverter)

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setState({ totalEarned: 0, pendingEarnings: 0, loading: false })
          return
        }
        const data = snap.data()
        setState({
          totalEarned:     data.totalEarned     ?? 0,
          pendingEarnings: data.pendingEarnings  ?? 0,
          loading:         false,
        })
      },
      () => setState((prev) => ({ ...prev, loading: false }))
    )

    return unsub
  }, [user])

  return state
}
