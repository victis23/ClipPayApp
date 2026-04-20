import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../utils/admin'
import { calculateEarnings } from '../utils/earnings'
import { logger } from '../utils/logger'

export const onClipUpdated = onDocumentUpdated('clips/{clipId}', async (event) => {
  const before = event.data?.before.data()
  const after  = event.data?.after.data()
  if (!before || !after) return

  const clipId     = event.params.clipId
  const campaignId = after['campaignId'] as string
  const clipperId  = after['clipperId'] as string

  const viewsBefore  = before['views']  as number ?? 0
  const viewsAfter   = after['views']   as number ?? 0
  const statusBefore = before['status'] as string
  const statusAfter  = after['status']  as string

  // Handle views change
  if (viewsAfter !== viewsBefore) {
    const campaignSnap = await db.collection('campaigns').doc(campaignId).get()
    if (!campaignSnap.exists) return

    const campaign = campaignSnap.data()!
    const newEarned = calculateEarnings(viewsAfter, campaign['cpmRate'] as number)
    const viewsDelta = viewsAfter - viewsBefore

    const batch = db.batch()

    batch.update(db.collection('clips').doc(clipId), {
      earnedAmount: newEarned,
    })

    batch.update(db.collection('campaigns').doc(campaignId), {
      totalViews: FieldValue.increment(viewsDelta),
      updatedAt:  FieldValue.serverTimestamp(),
    })

    await batch.commit()

    // Recalculate paidOut for campaign
    const verifiedClipsSnap = await db
      .collection('clips')
      .where('campaignId', '==', campaignId)
      .where('status', 'in', ['verified', 'paid'])
      .get()

    const paidOut = verifiedClipsSnap.docs.reduce(
      (s, d) => s + ((d.data()['earnedAmount'] as number) ?? 0),
      0
    )

    const campaignUpdate: Record<string, unknown> = {
      paidOut,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (paidOut >= (campaign['campaignCap'] as number)) {
      campaignUpdate['status'] = 'capped'
    }

    await db.collection('campaigns').doc(campaignId).update(campaignUpdate)

    // Update clipper pending earnings
    const pendingClipsSnap = await db
      .collection('clips')
      .where('clipperId', '==', clipperId)
      .where('status', 'in', ['pending', 'verified'])
      .get()

    const pendingEarnings = pendingClipsSnap.docs.reduce(
      (s, d) => s + ((d.data()['earnedAmount'] as number) ?? 0),
      0
    )

    await db.collection('users').doc(clipperId).update({ pendingEarnings })

    logger.info('Clip views updated', { clipId, viewsDelta, newEarned })
  }

  // Handle status change to 'paid'
  if (statusBefore !== 'paid' && statusAfter === 'paid') {
    const earnedAmount = after['earnedAmount'] as number ?? 0
    await db.collection('users').doc(clipperId).update({
      totalEarned:     FieldValue.increment(earnedAmount),
      pendingEarnings: FieldValue.increment(-earnedAmount),
    })
    logger.info('Clip paid, earnings updated', { clipId, clipperId, earnedAmount })
  }
})
