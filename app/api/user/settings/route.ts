import { NextResponse } from 'next/server'
import { getSessionTokenFromRequest, getUserBySessionToken } from '@/lib/server/auth-db'
import { getUserSettingsFromDb, saveUserSettingsToDb } from '@/lib/server/user-db'

export async function GET(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await getUserSettingsFromDb(user.id)
  return NextResponse.json({ settings })
}

export async function POST(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  await saveUserSettingsToDb(user.id, body.settings)
  return NextResponse.json({ ok: true })
}
