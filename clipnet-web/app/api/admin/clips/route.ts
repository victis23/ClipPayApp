import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase/server'
import { requireAuth, apiError } from '@/lib/firebase/authMiddleware'
import { ClipDoc } from '@/lib/types'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * GET /api/admin/clips
 * Returns clips with ?status=pending|verified|rejected (default: pending)
 * Admin only.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request, 'admin')
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Unauthorized', e.status ?? 401)
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pending'
  const limitParam = parseInt(searchParams.get('limit') ?? '50', 10)

  const snap = await adminDb
    .collection('clips')
    .where('status', '==', status)
    .orderBy('submittedAt', 'asc')
    .limit(limitParam)
    .get()

  const clips = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ClipDoc[]

  return Response.json({ data: clips, error: null })
}

/**
 * PATCH /api/admin/clips
 * Body: { clipId: string; action: 'approve' | 'reject'; rejectedReason?: string }
 * Admin only.
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAuth(request, 'admin')
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    return apiError(e.message ?? 'Unauthorized', e.status ?? 401)
  }

  let body: { clipId?: string; action?: string; rejectedReason?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const { clipId, action, rejectedReason } = body

  if (!clipId || typeof clipId !== 'string') {
    return apiError('clipId is required', 400)
  }
  if (action !== 'approve' && action !== 'reject') {
    return apiError('action must be "approve" or "reject"', 400)
  }
  if (action === 'reject' && (!rejectedReason || rejectedReason.trim().length === 0)) {
    return apiError('rejectedReason is required when rejecting a clip', 400)
  }

  const clipRef = adminDb.collection('clips').doc(clipId)
  const clipSnap = await clipRef.get()

  if (!clipSnap.exists) {
    return apiError('Clip not found', 404)
  }

  const clipData = clipSnap.data() as ClipDoc

  if (clipData.status !== 'pending') {
    return apiError(`Clip is already "${clipData.status}" — only pending clips can be reviewed`, 409)
  }

  if (action === 'approve') {
    await clipRef.update({
      status: 'verified',
      verifiedAt: FieldValue.serverTimestamp(),
      rejectedReason: FieldValue.delete(),
    })
    return Response.json({ data: { clipId, status: 'verified' }, error: null })
  }

  // reject
  await clipRef.update({
    status: 'rejected',
    rejectedReason: rejectedReason!.trim(),
    verifiedAt: FieldValue.delete(),
  })
  return Response.json({ data: { clipId, status: 'rejected' }, error: null })
}
