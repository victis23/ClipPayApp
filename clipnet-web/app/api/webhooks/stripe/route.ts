import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  try {
    const eventType = event.type as string

    if (eventType === 'transfer.created') {
      const transfer = event.data.object as Stripe.Transfer
      await updatePayoutStatus(transfer.id, 'processing')
    } else if (eventType === 'transfer.paid') {
      const transfer = event.data.object as Stripe.Transfer
      await updatePayoutStatus(transfer.id, 'completed')
    } else if (eventType === 'transfer.failed') {
      const transfer = event.data.object as Stripe.Transfer
      await updatePayoutStatus(transfer.id, 'failed')

      const snap = await adminDb
        .collection('payouts')
        .where('stripeTransferId', '==', transfer.id)
        .limit(1)
        .get()

      if (!snap.empty) {
        const clipIds = (snap.docs[0].data()?.['clipIds'] as string[]) ?? []
        const batch   = adminDb.batch()
        for (const clipId of clipIds) {
          batch.update(adminDb.collection('clips').doc(clipId), { status: 'verified', paidAt: null })
        }
        await batch.commit()
      }
    }
  } catch {
    return new Response('Internal error', { status: 500 })
  }

  return Response.json({ received: true })
}

async function updatePayoutStatus(transferId: string, status: string): Promise<void> {
  const snap = await adminDb
    .collection('payouts')
    .where('stripeTransferId', '==', transferId)
    .limit(1)
    .get()
  if (!snap.empty) {
    await snap.docs[0].ref.update({ status })
  }
}
