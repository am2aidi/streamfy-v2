import { NextResponse } from 'next/server'
import { getSessionTokenFromRequest, getUserBySessionToken } from '@/lib/server/auth-db'
import { getUserPlaylistsFromDb, saveUserPlaylistsToDb } from '@/lib/server/user-db'

export async function GET(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const playlists = await getUserPlaylistsFromDb(user.id)
  return NextResponse.json({ playlists })
}

export async function POST(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  await saveUserPlaylistsToDb(user.id, Array.isArray(body?.playlists) ? body.playlists : [])
  return NextResponse.json({ ok: true })
}
