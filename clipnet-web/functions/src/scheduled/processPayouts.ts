import { onSchedule } from 'firebase-functions/v2/scheduler'
import { FieldValue } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { db } from '../utils/admin'
import { logger } from '../utils/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-03-31.basil' as Parameters<typeof Stripe>[1]['apiVersion'],
})

const resend = new Resend(process.env.RESEND_API_KEY)

export const processPayouts = onSchedule('every day 02:00', async () => {
  // Find clippers with sufficient pending earnings
  const usersSnap = await db
    .collection('users')
    .where('role', '==', 'clipper')
    .where('pendingEarnings', '>=', 50)
    .get()

  logger.info(`processPayouts: ${usersSnap.size} eligible clippers`)

  for (const userDoc of usersSnap.docs) {
    const user      = userDoc.data()
    const clipperId = userDoc.id

    try {
      // Get verified clips
      const clipsSnap = await db
        .collection('clips')
        .where('clipperId', '==', clipperId)
        .where('status', '==', 'verified')
        .get()

      if (clipsSnap.empty) continue

      // Group by campaign to check minimumPayoutViews
      const campaignViews = new Map<string, number>()
      for (const clipDoc of clipsSnap.docs) {
        const clip = clipDoc.data()
        const cid  = clip['campaignId'] as string
        campaignViews.set(cid, (campaignViews.get(cid) ?? 0) + (clip['views'] as number ?? 0))
      }

      const eligibleClipIds: string[] = []
      let totalAmount = 0

      for (const clipDoc of clipsSnap.docs) {
        const clip       = clipDoc.data()
        const cid        = clip['campaignId'] as string
        const campaignSnap = await db.collection('campaigns').doc(cid).get()
        const campaign   = campaignSnap.data()

        if (!campaign) continue
        const minViews = campaign['minimumPayoutViews'] as number ?? 0

        if ((campaignViews.get(cid) ?? 0) >= minViews) {
          eligibleClipIds.push(clipDoc.id)
          totalAmount += clip['earnedAmount'] as number ?? 0
        }
      }

      if (eligibleClipIds.length === 0 || totalAmount <= 0) continue

      let stripeTransferId: string | undefined

      if (user['stripeAccountId']) {
        const transfer = await stripe.transfers.create({
          amount:      Math.round(totalAmount * 100),
          currency:    'usd',
          destination: user['stripeAccountId'] as string,
        })
        stripeTransferId = transfer.id
      }

      // Batch update clips + create payout doc
      const batch     = db.batch()
      const now       = FieldValue.serverTimestamp()
      const payoutRef = db.collection('payouts').doc()

      for (const clipId of eligibleClipIds) {
        batch.update(db.collection('clips').doc(clipId), { status: 'paid', paidAt: now })
      }

      batch.set(payoutRef, {
        id:         payoutRef.id,
        clipperId,
        campaignId: clipsSnap.docs[0]?.data()['campaignId'] ?? '',
        amount:     totalAmount,
        method:     stripeTransferId ? 'stripe' : 'usdt',
        status:     'pending',
        clipIds:    eligibleClipIds,
        createdAt:  now,
        ...(stripeTransferId ? { stripeTransferId } : {}),
      })

      // Update public stats
      batch.set(
        db.collection('stats').doc('public'),
        { totalPaidOut: FieldValue.increment(totalAmount), updatedAt: now },
        { merge: true }
      )

      await batch.commit()

      // Send confirmation email
      if (user['email']) {
        await resend.emails.send({
          from:    'ClipNet <payouts@clipnet.io>',
          to:      user['email'] as string,
          subject: `Your ClipNet payout of $${totalAmount.toFixed(2)} is on the way`,
          html:    `<p>Hi ${user['displayName'] ?? 'Clipper'},</p>
                    <p>Your payout of <strong>$${totalAmount.toFixed(2)}</strong> has been initiated and should arrive in 2–3 business days.</p>
                    <p>Clips included: ${eligibleClipIds.length}</p>
                    <p>Thanks for clipping!</p>
                    <p>— The ClipNet Team</p>`,
        })
      }

      logger.info('Payout processed', { clipperId, totalAmount, clipCount: eligibleClipIds.length })
    } catch (err) {
      logger.error('Payout failed for clipper', { clipperId, error: err })
    }
  }

  logger.info('processPayouts: complete')
})
