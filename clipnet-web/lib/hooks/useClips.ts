'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/client'
import { clipConverter } from '../firebase/converters'
import { useAuthStore } from '../store/authStore'
import { ClipDoc } from '../types'

export function useClips() {
  const { user } = useAuthStore()
  const [clips, setClips]   = useState<ClipDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<Error | null>(null)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'clips').withConverter(clipConverter),
      where('clipperId', '==', user.uid),
      orderBy('submittedAt', 'desc')
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        setClips(snap.docs.map((d) => d.data()))
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsub
  }, [user])

  return { clips, loading, error }
}

export function useCampaignClips(campaignId: string) {
  const [clips, setClips]     = useState<ClipDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<Error | null>(null)

  useEffect(() => {
    if (!campaignId) return

    const q = query(
      collection(db, 'clips').withConverter(clipConverter),
      where('campaignId', '==', campaignId),
      orderBy('submittedAt', 'desc')
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        setClips(snap.docs.map((d) => d.data()))
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsub
  }, [campaignId])

  return { clips, loading, error }
}
