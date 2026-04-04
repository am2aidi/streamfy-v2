import { NextResponse } from 'next/server'
import { getSessionTokenFromRequest, getUserBySessionToken } from '@/lib/server/auth-db'
import { getUserProfileFromDb, saveUserProfileToDb } from '@/lib/server/user-db'

export async function GET(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await getUserProfileFromDb(user.id)
  return NextResponse.json({ profile })
}

export async function POST(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  await saveUserProfileToDb(user.id, {
    fullName: String(body?.fullName ?? ''),
    username: String(body?.username ?? ''),
    email: String(body?.email ?? ''),
    phone: String(body?.phone ?? ''),
    bio: typeof body?.bio === 'string' ? body.bio : '',
    publicProfile: body?.publicProfile !== false,
  })
  const profile = await getUserProfileFromDb(user.id)
  return NextResponse.json({ ok: true, profile })
}
