/**
 * Seed script — run with: npx ts-node --esm scripts/seed.ts
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars.
 * Connects to Firebase Emulator if FIRESTORE_EMULATOR_HOST is set.
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const app = initializeApp({
  credential: cert({
    projectId:   process.env.FIREBASE_PROJECT_ID ?? 'clipnet-dev',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? 'seed@clipnet-dev.iam.gserviceaccount.com',
    privateKey:  (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  }),
})

const db   = getFirestore(app)
const auth = getAuth(app)

async function createUser(
  email: string,
  password: string,
  displayName: string,
  role: 'brand' | 'clipper'
): Promise<string> {
  let uid: string
  try {
    const existing = await auth.getUserByEmail(email)
    uid = existing.uid
    console.log(`User exists: ${email} (${uid})`)
  } catch {
    const user = await auth.createUser({ email, password, displayName })
    uid = user.uid
    console.log(`Created user: ${email} (${uid})`)
  }

  await db.collection('users').doc(uid).set(
    {
      uid,
      role,
      displayName,
      email,
      ftcLabel:    '#ad',
      createdAt:   FieldValue.serverTimestamp(),
      updatedAt:   FieldValue.serverTimestamp(),
      ...(role === 'clipper'
        ? { totalEarned: 0, pendingEarnings: 0 }
        : { totalCampaignSpend: 0 }),
    },
    { merge: true }
  )

  return uid
}

async function main() {
  console.log('🌱 Seeding ClipNet...')

  // Create brand users
  const brand1Id = await createUser('brand1@clipnet.test', 'Password123!', 'Studio One', 'brand')
  const brand2Id = await createUser('brand2@clipnet.test', 'Password123!', 'Nexus Media', 'brand')

  // Create clipper users
  const clipper1Id = await createUser('clipper1@clipnet.test', 'Password123!', 'ViralVince', 'clipper')
  const clipper2Id = await createUser('clipper2@clipnet.test', 'Password123!', 'ClipQueenAlex', 'clipper')
  const clipper3Id = await createUser('clipper3@clipnet.test', 'Password123!', 'ByteSurfer', 'clipper')

  // Campaign data matching iOS app sample data
  const campaigns = [
    {
      brandId:             brand1Id,
      creatorName:         'Caleb Hammer',
      cpmRate:             0.75,
      campaignCap:         15000,
      minimumPayoutViews:  1000,
      ftcLabel:            '#ad',
      platforms:           ['tiktok', 'instagram', 'x'],
      accentIndex:         0,
      status:              'active',
      totalViews:          847200000,
      totalClips:          312,
      clippersCount:       87,
      paidOut:             7420,
    },
    {
      brandId:             brand1Id,
      creatorName:         'Pirate Software',
      cpmRate:             3.00,
      campaignCap:         10000,
      minimumPayoutViews:  5000,
      ftcLabel:            '#sponsored',
      platforms:           ['tiktok', 'instagram', 'youtube', 'x'],
      accentIndex:         1,
      status:              'active',
      totalViews:          210000000,
      totalClips:          98,
      clippersCount:       41,
      paidOut:             4200,
      bounty:              { thresholdViews: 1000000, payoutAmount: 3000 },
    },
    {
      brandId:             brand2Id,
      creatorName:         'Clavicular',
      cpmRate:             1.20,
      campaignCap:         8000,
      minimumPayoutViews:  2000,
      ftcLabel:            '#ad',
      platforms:           ['tiktok', 'instagram', 'youtube'],
      accentIndex:         2,
      status:              'capped',
      totalViews:          500000000,
      totalClips:          225,
      clippersCount:       63,
      paidOut:             8000,
    },
    {
      brandId:             brand2Id,
      creatorName:         'Aiden Ross',
      cpmRate:             0.85,
      campaignCap:         12000,
      minimumPayoutViews:  1000,
      ftcLabel:            '#ad',
      platforms:           ['tiktok', 'instagram'],
      accentIndex:         3,
      status:              'active',
      totalViews:          320000000,
      totalClips:          178,
      clippersCount:       55,
      paidOut:             3100,
    },
    {
      brandId:             brand1Id,
      creatorName:         'Asmon Gold',
      cpmRate:             0.60,
      campaignCap:         8000,
      minimumPayoutViews:  500,
      ftcLabel:            '#ad',
      platforms:           ['youtube', 'tiktok', 'x'],
      accentIndex:         4,
      status:              'active',
      totalViews:          195000000,
      totalClips:          143,
      clippersCount:       38,
      paidOut:             1800,
    },
  ]

  const campaignIds: string[] = []
  for (const c of campaigns) {
    const ref = db.collection('campaigns').doc()
    await ref.set({
      ...c,
      id:        ref.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    campaignIds.push(ref.id)
    console.log(`Created campaign: ${c.creatorName} (${ref.id})`)
  }

  // Seed clips (15 total, mixed statuses)
  const clipStatuses = [
    'pending', 'verified', 'paid', 'pending', 'verified',
    'paid', 'pending', 'rejected', 'verified', 'paid',
    'pending', 'verified', 'paid', 'pending', 'verified',
  ] as const

  const platforms = ['tiktok', 'instagram', 'youtube', 'x'] as const
  const clippers  = [clipper1Id, clipper2Id, clipper3Id]

  for (let i = 0; i < 15; i++) {
    const campaignId = campaignIds[i % campaignIds.length]
    const clipperId  = clippers[i % clippers.length]
    const status     = clipStatuses[i]
    const views      = [50000, 120000, 250000, 480000, 1200000][i % 5]
    const cpmRate    = [0.75, 3.00, 1.20, 0.85, 0.60][i % 5]
    const earned     = (views / 1000) * cpmRate

    const clipRef = db.collection('clips').doc()
    await clipRef.set({
      id:                  clipRef.id,
      campaignId,
      clipperId,
      clipperDisplayName:  ['ViralVince', 'ClipQueenAlex', 'ByteSurfer'][i % 3],
      creatorName:         campaigns[i % 5].creatorName,
      platform:            platforms[i % 4],
      clipUrl:             `https://www.tiktok.com/@example/video/${100000000000 + i}`,
      ftcLabel:            '#ad',
      ftcConfirmed:        true,
      views,
      earnedAmount:        earned,
      status,
      submittedAt:         Timestamp.fromDate(new Date(Date.now() - i * 86400000)),
      ...(status === 'verified' || status === 'paid'
        ? { verifiedAt: Timestamp.fromDate(new Date(Date.now() - i * 43200000)) }
        : {}),
      ...(status === 'paid'
        ? { paidAt: Timestamp.fromDate(new Date(Date.now() - i * 21600000)) }
        : {}),
      ...(status === 'rejected'
        ? { rejectedReason: 'FTC label not visible in video' }
        : {}),
    })
  }
  console.log('Created 15 clips')

  // Set clipper1 earnings data (~$485)
  await db.collection('users').doc(clipper1Id).update({
    totalEarned:     485.50,
    pendingEarnings: 142.25,
  })
  console.log('Set earnings for clipper1')

  // Initialize public stats
  await db.collection('stats').doc('public').set({
    activeCampaigns: 3,
    totalViews:      1572200000,
    totalPaidOut:    24520,
    updatedAt:       FieldValue.serverTimestamp(),
  })
  console.log('Initialized public stats')

  console.log('✅ Seed complete!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
