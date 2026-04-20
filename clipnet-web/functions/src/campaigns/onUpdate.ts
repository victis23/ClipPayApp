import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../utils/admin'
import { logger } from '../utils/logger'

export const onCampaignUpdated = onDocumentUpdated('campaigns/{campaignId}', async (event) => {
  const before = event.data?.before.data()
  const after  = event.data?.after.data()
  if (!before || !after) return

  const campaignId = event.params.campaignId
  const statusBefore = before['status'] as string
  const statusAfter  = after['status']  as string

  if (statusBefore === statusAfter) return

  const statsRef = db.collection('stats').doc('public')

  if (statusBefore === 'active' && statusAfter !== 'active') {
    await statsRef.set(
      { activeCampaigns: FieldValue.increment(-1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    )
  } else if (statusBefore !== 'active' && statusAfter === 'active') {
    await statsRef.set(
      { activeCampaigns: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    )
  }

  logger.info('Campaign status changed', { campaignId, statusBefore, statusAfter })
})
