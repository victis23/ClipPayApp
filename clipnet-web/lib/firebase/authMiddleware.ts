import { adminAuth, adminDb } from './server'
import { AppRole } from '../types'

export async function requireAuth(
  request: Request,
  requiredRole?: AppRole
): Promise<{ uid: string; role: AppRole }> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Missing authorization token'), { status: 401 })
  }

  const idToken = authHeader.slice(7)
  let decodedToken: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>

  try {
    decodedToken = await adminAuth.verifyIdToken(idToken)
  } catch {
    throw Object.assign(new Error('Invalid or expired token'), { status: 401 })
  }

  const userSnap = await adminDb.collection('users').doc(decodedToken.uid).get()
  if (!userSnap.exists) {
    throw Object.assign(new Error('User profile not found'), { status: 401 })
  }

  const role = userSnap.data()?.['role'] as AppRole

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    throw Object.assign(new Error('Insufficient permissions'), { status: 403 })
  }

  return { uid: decodedToken.uid, role }
}

export function apiError(message: string, status: number): Response {
  return Response.json({ data: null, error: message }, { status })
}
