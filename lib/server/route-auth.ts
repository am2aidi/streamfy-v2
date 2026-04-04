import { NextResponse } from 'next/server'
import { getSessionTokenFromRequest, getUserBySessionToken } from '@/lib/server/auth-db'

export async function requireSessionUser(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user, response: null }
}

export async function requireAdminUser(req: Request) {
  const { user, response } = await requireSessionUser(req)
  if (!user) return { user: null, response }
  if (user.role !== 'admin' || user.status !== 'active') {
    return { user: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, response: null }
}
