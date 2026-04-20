import { create } from 'zustand'
import { User as FirebaseUser } from 'firebase/auth'
import { UserDoc } from '../types'

interface AuthState {
  user: FirebaseUser | null
  profile: UserDoc | null
  loading: boolean
  setUser: (user: FirebaseUser | null) => void
  setProfile: (profile: UserDoc | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  profile: null,
  loading: true,
  setUser:    (user)    => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, profile: null, loading: false }),
}))
