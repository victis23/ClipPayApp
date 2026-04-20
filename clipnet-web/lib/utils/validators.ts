import { z } from 'zod'

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'x'] as const

const campaignStatusValues = ['active', 'paused', 'capped', 'ended'] as const

export const CreateCampaignSchema = z.object({
  creatorName: z.string().min(1).max(100),
  cpmRate: z.number().positive(),
  campaignCap: z.number().positive(),
  minimumPayoutViews: z.number().int().nonnegative(),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  ftcLabel: z.string().min(1).max(50),
  bounty: z
    .object({
      thresholdViews: z.number().int().positive(),
      payoutAmount: z.number().positive(),
    })
    .optional(),
})

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>

export const SubmitClipSchema = z.object({
  campaignId: z.string().min(1),
  platform: z.enum(PLATFORMS),
  clipUrl: z.string().url('Must be a valid URL'),
  ftcConfirmed: z.literal(true, {
    error: 'FTC disclosure confirmation is required',
  }),
})

export type SubmitClipInput = z.infer<typeof SubmitClipSchema>

export const RequestPayoutSchema = z.object({
  method: z.enum(['stripe', 'usdt']),
})

export type RequestPayoutInput = z.infer<typeof RequestPayoutSchema>

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(80),
  role: z.enum(['brand', 'clipper']),
})

export type SignupInput = z.infer<typeof SignupSchema>

// State machine: client can only set active/paused/ended — capped is set by CF only
const allowedClientStatuses = ['active', 'paused', 'ended'] as const

export const UpdateCampaignSchema = z
  .object({
    status: z.enum(allowedClientStatuses),
  })
  .refine(
    (data) => campaignStatusValues.includes(data.status as typeof campaignStatusValues[number]),
    { message: 'Invalid status transition' }
  )

export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>
