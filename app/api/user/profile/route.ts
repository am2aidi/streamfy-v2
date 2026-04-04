import { NextResponse } from 'next/server'
import { getSessionTokenFromRequest, getUserBySessionToken } from '@/lib/server/auth-db'
import { getUserProfileFromDb, saveUserProfileToDb, UserProfileConflictError } from '@/lib/server/user-db'

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
  try {
    await saveUserProfileToDb(user.id, {
      fullName: String(body?.fullName ?? ''),
      username: String(body?.username ?? ''),
      email: String(body?.email ?? ''),
      phone: String(body?.phone ?? ''),
      bio: typeof body?.bio === 'string' ? body.bio : '',
      publicProfile: body?.publicProfile !== false,
    })
  } catch (error) {
    if (error instanceof UserProfileConflictError) {
      return NextResponse.json({ error: 'exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unable to save profile' }, { status: 400 })
  }
  const profile = await getUserProfileFromDb(user.id)
  return NextResponse.json({ ok: true, profile })
}
