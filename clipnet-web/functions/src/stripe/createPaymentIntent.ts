import { onCall, HttpsError } from 'firebase-functions/v2/https'
import Stripe from 'stripe'
import { logger } from '../utils/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-03-31.basil' as Parameters<typeof Stripe>[1]['apiVersion'],
})

interface CreatePaymentIntentData {
  campaignId: string
  amount:     number
}

export const createPaymentIntent = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required')
  }

  const data = request.data as CreatePaymentIntentData

  if (!data.campaignId || !data.amount || data.amount <= 0) {
    throw new HttpsError('invalid-argument', 'campaignId and positive amount required')
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount:   Math.round(data.amount * 100),
      currency: 'usd',
      metadata: {
        campaignId: data.campaignId,
        brandId:    request.auth.uid,
      },
    })

    logger.info('PaymentIntent created', { campaignId: data.campaignId, amount: data.amount })

    return { clientSecret: intent.client_secret }
  } catch (err) {
    logger.error('Failed to create PaymentIntent', { err })
    throw new HttpsError('internal', 'Failed to create payment intent')
  }
})
