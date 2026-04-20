import { Timestamp } from 'firebase/firestore'

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'x'

export type AppRole = 'brand' | 'clipper' | 'admin'

export type CampaignStatus = 'active' | 'paused' | 'capped' | 'ended'

export type ClipStatus = 'pending' | 'verified' | 'paid' | 'rejected'

export type ApplicationStatus = 'approved' | 'pending' | 'rejected'

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type PayoutMethod = 'stripe' | 'usdt'

export interface UserDoc {
  uid: string
  role: AppRole
  displayName: string
  email: string
  avatarUrl?: string
  // Clipper-only
  totalEarned?: number
  pendingEarnings?: number
  stripeAccountId?: string
  usdtWalletAddress?: string
  ftcLabel?: string
  // Brand-only
  totalCampaignSpend?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CampaignBounty {
  thresholdViews: number
  payoutAmount: number
}

export interface CampaignDoc {
  id: string
  brandId: string
  creatorName: string
  cpmRate: number
  campaignCap: number
  minimumPayoutViews: number
  ftcLabel: string
  platforms: Platform[]
  accentIndex: number
  status: CampaignStatus
  totalViews: number
  totalClips: number
  clippersCount: number
  paidOut: number
  bounty?: CampaignBounty
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ClipDoc {
  id: string
  campaignId: string
  clipperId: string
  clipperDisplayName: string
  creatorName: string
  platform: Platform
  clipUrl: string
  ftcLabel: string
  ftcConfirmed: boolean
  views: number
  earnedAmount: number
  status: ClipStatus
  submittedAt: Timestamp
  verifiedAt?: Timestamp
  paidAt?: Timestamp
  rejectedReason?: string
}

export interface ApplicationDoc {
  id: string
  campaignId: string
  clipperId: string
  status: ApplicationStatus
  appliedAt: Timestamp
}

export interface PayoutDoc {
  id: string
  clipperId: string
  campaignId: string
  amount: number
  method: PayoutMethod
  stripeTransferId?: string
  usdtTxHash?: string
  status: PayoutStatus
  clipIds: string[]
  createdAt: Timestamp
}

export interface SocialAccountDoc {
  clipperId: string
  platform: Platform
  platformUserId: string
  accessToken: string
  refreshToken?: string
  expiresAt?: Timestamp
  linkedAt: Timestamp
}

export interface ViewPollLogDoc {
  clipId: string
  platform: Platform
  previousViews: number
  newViews: number
  delta: number
  polledAt: Timestamp
  success: boolean
  error?: string
}

export interface PublicStatsDoc {
  activeCampaigns: number
  totalViews: number
  totalPaidOut: number
  updatedAt: Timestamp
}

// Accent color sets (index 0-4)
export const ACCENT_COLORS: readonly string[] = [
  'cn-amber',
  'cn-teal',
  'cn-purple',
  'cn-blue',
  'cn-pink',
] as const
