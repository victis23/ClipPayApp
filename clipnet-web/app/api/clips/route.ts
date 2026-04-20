import { NextRequest } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/server'
import { requireAuth, apiError } from '@/lib/firebase/authMiddleware'
import { SubmitClipSchema } from '@/lib/utils/validators'
import { CampaignDoc, ClipDoc } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { uid } = await requireAuth(request, 'clipper')
    const snap = await adminDb
      .collection('clips')
      .where('clipperId', '==', uid)
      .orderBy('submittedAt', 'desc')
      .get()
    const clips = snap.docs.map((d) => ({ ...d.data(), id: d.id }))
    return Response.json({ data: clips, error: null })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Unauthorized', e.status ?? 401)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid, role } = await requireAuth(request, 'clipper')

    const body: unknown = await request.json()
    const parsed = SubmitClipSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400)
    }

    const { campaignId, platform, clipUrl, ftcConfirmed } = parsed.data

    // Enforce FTC at API layer
    if (ftcConfirmed !== true) {
      return apiError('FTC disclosure confirmation is required', 400)
    }

    // Verify campaign is active and not capped
    const campaignSnap = await adminDb.collection('campaigns').doc(campaignId).get()
    if (!campaignSnap.exists) return apiError('Campaign not found', 404)

    const campaign = campaignSnap.data() as CampaignDoc
    if (campaign.status !== 'active') {
      return apiError('Campaign is not accepting clips', 422)
    }
    if (campaign.paidOut >= campaign.campaignCap) {
      return apiError('Campaign spend cap has been reached', 422)
    }

    // Fetch clipper profile for denormalization
    const clipperSnap = await adminDb.collection('users').doc(uid).get()
    const clipperName = clipperSnap.data()?.['displayName'] as string ?? 'Unknown'

    const ref = adminDb.collection('clips').doc()
    const clip: Omit<ClipDoc, 'submittedAt'> & { submittedAt: FirebaseFirestore.FieldValue } = {
      id:                  ref.id,
      campaignId,
      clipperId:           uid,
      clipperDisplayName:  clipperName,
      creatorName:         campaign.creatorName,
      platform,
      clipUrl,
      ftcLabel:            campaign.ftcLabel,
      ftcConfirmed:        true,
      views:               0,
      earnedAmount:        0,
      status:              'pending',
      submittedAt:         FieldValue.serverTimestamp(),
    }

    await ref.set(clip)

    return Response.json({ data: { ...clip, id: ref.id }, error: null }, { status: 201 })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Server error', e.status ?? 500)
  }
}
