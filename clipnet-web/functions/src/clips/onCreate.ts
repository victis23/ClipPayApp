import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../utils/admin'
import { logger } from '../utils/logger'

export const onClipCreated = onDocumentCreated('clips/{clipId}', async (event) => {
  const clip = event.data?.data()
  if (!clip) return

  const { campaignId, clipperId, clipId } = {
    campaignId: clip['campaignId'] as string,
    clipperId:  clip['clipperId'] as string,
    clipId:     event.params.clipId,
  }

  const campaignRef = db.collection('campaigns').doc(campaignId)
  const campaignSnap = await campaignRef.get()

  if (!campaignSnap.exists) {
    logger.error('Campaign not found for clip', { clipId, campaignId })
    return
  }

  const campaign = campaignSnap.data()!
  if (campaign['status'] !== 'active' || campaign['paidOut'] >= campaign['campaignCap']) {
    logger.warn('Clip created on ineligible campaign', { clipId, campaignId })
    return
  }

  // Check if this clipper is new to this campaign
  const appSnap = await db
    .collection('applications')
    .where('campaignId', '==', campaignId)
    .where('clipperId', '==', clipperId)
    .limit(1)
    .get()

  const isNewClipper = appSnap.empty

  await campaignRef.update({
    totalClips:    FieldValue.increment(1),
    clippersCount: isNewClipper ? FieldValue.increment(1) : FieldValue.increment(0),
    updatedAt:     FieldValue.serverTimestamp(),
  })

  // Initialize earnedAmount
  await db.collection('clips').doc(clipId).update({ earnedAmount: 0 })

  logger.info('Clip onCreate processed', { clipId, campaignId, isNewClipper })
})
