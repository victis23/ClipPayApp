import { NextRequest } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase/server'
import { requireAuth, apiError } from '@/lib/firebase/authMiddleware'
import { RequestPayoutSchema } from '@/lib/utils/validators'
import { ClipDoc, PayoutDoc, UserDoc, CampaignDoc } from '@/lib/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(request: NextRequest) {
  try {
    const { uid } = await requireAuth(request, 'clipper')

    const body: unknown = await request.json()
    const parsed = RequestPayoutSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400)
    }
    const { method } = parsed.data

    // Verify minimum earnings
    const userSnap = await adminDb.collection('users').doc(uid).get()
    const userDoc  = userSnap.data() as UserDoc
    if ((userDoc.pendingEarnings ?? 0) < 50) {
      return apiError('Minimum payout threshold is $50', 422)
    }

    // Fetch all verified clips for this clipper
    const clipsSnap = await adminDb
      .collection('clips')
      .where('clipperId', '==', uid)
      .where('status', '==', 'verified')
      .get()

    if (clipsSnap.empty) {
      return apiError('No verified clips available for payout', 422)
    }

    const clips = clipsSnap.docs.map((d) => ({ ...d.data(), id: d.id } as ClipDoc))

    // Check minimumPayoutViews per campaign
    const eligibleClips: ClipDoc[] = []
    const campaignCache = new Map<string, CampaignDoc>()

    for (const clip of clips) {
      let campaign = campaignCache.get(clip.campaignId)
      if (!campaign) {
        const cs = await adminDb.collection('campaigns').doc(clip.campaignId).get()
        campaign = { ...cs.data(), id: cs.id } as CampaignDoc
        campaignCache.set(clip.campaignId, campaign)
      }

      // Aggregate views for this clipper on this campaign
      const clipperCampaignClips = clips.filter(
        (c) => c.campaignId === clip.campaignId && c.clipperId === uid
      )
      const totalViews = clipperCampaignClips.reduce((s, c) => s + c.views, 0)

      if (totalViews >= campaign.minimumPayoutViews) {
        eligibleClips.push(clip)
      }
    }

    if (eligibleClips.length === 0) {
      return apiError('No clips have reached the minimum view threshold', 422)
    }

    const totalAmount = eligibleClips.reduce((s, c) => s + c.earnedAmount, 0)
    const clipIds     = eligibleClips.map((c) => c.id)

    let stripeTransferId: string | undefined

    if (method === 'stripe') {
      if (!userDoc.stripeAccountId) {
        return apiError('Stripe account not connected', 422)
      }
      const transfer = await stripe.transfers.create({
        amount:      Math.round(totalAmount * 100),
        currency:    'usd',
        destination: userDoc.stripeAccountId,
      })
      stripeTransferId = transfer.id
    }

    // Batch update: mark clips as paid + create payout doc
    const batch   = adminDb.batch()
    const now     = FieldValue.serverTimestamp()
    const payoutRef = adminDb.collection('payouts').doc()

    for (const clipId of clipIds) {
      batch.update(adminDb.collection('clips').doc(clipId), {
        status: 'paid',
        paidAt: now,
      })
    }

    const payoutDoc: Omit<PayoutDoc, 'createdAt'> & { createdAt: FirebaseFirestore.FieldValue } = {
      id:         payoutRef.id,
      clipperId:  uid,
      campaignId: eligibleClips[0]?.campaignId ?? '',
      amount:     totalAmount,
      method,
      status:     'pending',
      clipIds,
      createdAt:  now,
      ...(stripeTransferId ? { stripeTransferId } : {}),
    }

    batch.set(payoutRef, payoutDoc)
    await batch.commit()

    return Response.json({ data: { id: payoutRef.id, amount: totalAmount }, error: null }, { status: 201 })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Server error', e.status ?? 500)
  }
}
