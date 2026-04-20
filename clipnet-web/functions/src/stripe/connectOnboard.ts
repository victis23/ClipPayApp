import { onCall, HttpsError } from 'firebase-functions/v2/https'
import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../utils/admin'
import { logger } from '../utils/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-03-31.basil' as Parameters<typeof Stripe>[1]['apiVersion'],
})

export const connectOnboard = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required')
  }

  const uid = request.auth.uid

  const userRef  = db.collection('users').doc(uid)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    throw new HttpsError('not-found', 'User profile not found')
  }

  const user = userSnap.data()!
  if (user['role'] !== 'clipper') {
    throw new HttpsError('permission-denied', 'Only clippers can connect Stripe')
  }

  let stripeAccountId = user['stripeAccountId'] as string | undefined

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type:  'express',
      email: user['email'] as string,
      capabilities: {
        transfers: { requested: true },
      },
    })
    stripeAccountId = account.id

    await userRef.update({
      stripeAccountId,
      updatedAt: FieldValue.serverTimestamp(),
    })

    logger.info('Stripe Connect account created', { uid, stripeAccountId })
  }

  const returnUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/account?stripe=success`
  const refreshUrl = `${process.env.NEXT_PUBLIC_APP_URL}/account?stripe=refresh`

  const accountLink = await stripe.accountLinks.create({
    account:     stripeAccountId,
    refresh_url: refreshUrl,
    return_url:  returnUrl,
    type:        'account_onboarding',
  })

  return { url: accountLink.url }
})
