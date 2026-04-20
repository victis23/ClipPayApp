import { NextRequest } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/server'
import { requireAuth, apiError } from '@/lib/firebase/authMiddleware'
import { CreateCampaignSchema } from '@/lib/utils/validators'
import { CampaignDoc, CampaignStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { uid, role } = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const status   = searchParams.get('status')   as CampaignStatus | null
    const platform = searchParams.get('platform')
    const sort     = searchParams.get('sort') ?? 'newest'

    let query = adminDb.collection('campaigns') as FirebaseFirestore.Query

    if (role === 'brand') {
      query = query.where('brandId', '==', uid)
    } else {
      query = query.where('status', '==', status ?? 'active')
    }

    if (status && role === 'brand') {
      query = query.where('status', '==', status)
    }

    switch (sort) {
      case 'cpm_desc':
        query = query.orderBy('cpmRate', 'desc')
        break
      case 'views_desc':
        query = query.orderBy('totalViews', 'desc')
        break
      default:
        query = query.orderBy('createdAt', 'desc')
    }

    const snap = await query.get()
    const campaigns = snap.docs.map((d) => ({ ...d.data(), id: d.id }))

    const filtered = platform
      ? campaigns.filter((c) => (c as CampaignDoc).platforms.includes(platform as CampaignDoc['platforms'][number]))
      : campaigns

    return Response.json({ data: filtered, error: null })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Unauthorized', e.status ?? 401)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid } = await requireAuth(request, 'brand')

    const body: unknown = await request.json()
    const parsed = CreateCampaignSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400)
    }

    const data = parsed.data
    const ref  = adminDb.collection('campaigns').doc()

    const campaign: Omit<CampaignDoc, 'createdAt' | 'updatedAt'> & {
      createdAt: FirebaseFirestore.FieldValue
      updatedAt: FirebaseFirestore.FieldValue
    } = {
      id:                  ref.id,
      brandId:             uid,
      creatorName:         data.creatorName,
      cpmRate:             data.cpmRate,
      campaignCap:         data.campaignCap,
      minimumPayoutViews:  data.minimumPayoutViews,
      ftcLabel:            data.ftcLabel,
      platforms:           data.platforms,
      accentIndex:         Math.floor(Math.random() * 5),
      status:              'active',
      totalViews:          0,
      totalClips:          0,
      clippersCount:       0,
      paidOut:             0,
      ...(data.bounty ? { bounty: data.bounty } : {}),
      createdAt:           FieldValue.serverTimestamp(),
      updatedAt:           FieldValue.serverTimestamp(),
    }

    await ref.set(campaign)

    return Response.json({ data: { ...campaign, id: ref.id }, error: null }, { status: 201 })
  } catch (err) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Server error', e.status ?? 500)
  }
}
