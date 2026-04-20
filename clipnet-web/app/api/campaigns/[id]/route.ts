import { NextRequest } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/server'
import { requireAuth, apiError } from '@/lib/firebase/authMiddleware'
import { UpdateCampaignSchema } from '@/lib/utils/validators'
import { CampaignDoc, CampaignStatus } from '@/lib/types'

const VALID_CLIENT_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  active:  ['paused', 'ended'],
  paused:  ['active', 'ended'],
  capped:  ['ended'],
  ended:   [],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await requireAuth(request)
    const snap = await adminDb.collection('campaigns').doc(id).get()
    if (!snap.exists) return apiError('Campaign not found', 404)
    return Response.json({ data: { ...snap.data(), id: snap.id }, error: null })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Unauthorized', e.status ?? 401)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { uid } = await requireAuth(request, 'brand')

    const snap = await adminDb.collection('campaigns').doc(id).get()
    if (!snap.exists) return apiError('Campaign not found', 404)

    const campaign = snap.data() as CampaignDoc
    if (campaign.brandId !== uid) return apiError('Forbidden', 403)

    const body: unknown = await request.json()
    const parsed = UpdateCampaignSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400)
    }

    const { status: newStatus } = parsed.data
    const allowed = VALID_CLIENT_TRANSITIONS[campaign.status]

    if (!allowed.includes(newStatus as CampaignStatus)) {
      return apiError(
        `Cannot transition from ${campaign.status} to ${newStatus}`,
        422
      )
    }

    await adminDb.collection('campaigns').doc(id).update({
      status:    newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return Response.json({ data: { id, status: newStatus }, error: null })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Server error', e.status ?? 500)
  }
}
