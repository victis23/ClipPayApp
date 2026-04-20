'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase/client'
import { campaignConverter } from '../firebase/converters'
import { useAuthStore } from '../store/authStore'
import { CampaignDoc } from '../types'

export function useCampaigns() {
  const { user } = useAuthStore()
  const [campaigns, setCampaigns] = useState<CampaignDoc[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<Error | null>(null)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'campaigns').withConverter(campaignConverter),
      where('brandId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        setCampaigns(snap.docs.map((d) => d.data()))
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsub
  }, [user])

  return { campaigns, loading, error }
}

export async function fetchActiveCampaigns(): Promise<CampaignDoc[]> {
  const q = query(
    collection(db, 'campaigns').withConverter(campaignConverter),
    where('status', '==', 'active')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}
