import { onRequest } from 'firebase-functions/v2/https'
import Stripe from 'stripe'
import { db } from '../utils/admin'
import { logger } from '../utils/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-03-31.basil' as Parameters<typeof Stripe>[1]['apiVersion'],
})

export const stripeWebhook = onRequest(async (req, res) => {
  const sig     = req.headers['stripe-signature'] as string
  const secret  = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, secret)
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', { err })
    res.status(400).send('Webhook signature verification failed')
    return
  }

  try {
    switch (event.type) {
      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        await updatePayoutByTransferId(transfer.id, 'processing')
        break
      }
      case 'transfer.paid': {
        const transfer = event.data.object as Stripe.Transfer
        await updatePayoutByTransferId(transfer.id, 'completed')
        break
      }
      case 'transfer.failed': {
        const transfer = event.data.object as Stripe.Transfer
        await updatePayoutByTransferId(transfer.id, 'failed')
        // Re-queue clips by reverting status to verified
        const payoutsSnap = await db
          .collection('payouts')
          .where('stripeTransferId', '==', transfer.id)
          .limit(1)
          .get()
        if (!payoutsSnap.empty) {
          const payout = payoutsSnap.docs[0].data()
          const clipIds = payout['clipIds'] as string[] ?? []
          const batch   = db.batch()
          for (const clipId of clipIds) {
            batch.update(db.collection('clips').doc(clipId), { status: 'verified', paidAt: null })
          }
          await batch.commit()
        }
        break
      }
    }
  } catch (err) {
    logger.error('Error handling Stripe event', { type: event.type, err })
    res.status(500).send('Internal error')
    return
  }

  res.json({ received: true })
})

async function updatePayoutByTransferId(
  transferId: string,
  status: string
): Promise<void> {
  const snap = await db
    .collection('payouts')
    .where('stripeTransferId', '==', transferId)
    .limit(1)
    .get()

  if (!snap.empty) {
    await snap.docs[0].ref.update({ status })
  }
}
