import { NextResponse } from 'next/server'
import { deleteSessionByToken, getSessionTokenFromRequest, getUserBySessionToken } from '@/lib/server/auth-db'

export async function GET(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserBySessionToken(sessionToken)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ user })
}

export async function DELETE(req: Request) {
  const sessionToken = getSessionTokenFromRequest(req)
  if (sessionToken) {
    await deleteSessionByToken(sessionToken)
  }

  return NextResponse.json({ ok: true })
}
