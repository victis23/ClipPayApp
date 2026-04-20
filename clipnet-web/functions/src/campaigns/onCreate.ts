import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../utils/admin'
import { logger } from '../utils/logger'

export const onCampaignCreated = onDocumentCreated('campaigns/{campaignId}', async (event) => {
  const campaign = event.data?.data()
  if (!campaign) return

  const campaignId = event.params.campaignId

  // Update public stats doc
  const statsRef = db.collection('stats').doc('public')
  await statsRef.set(
    {
      activeCampaigns: FieldValue.increment(1),
      updatedAt:       FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  logger.info('Campaign created, stats updated', { campaignId })
})
