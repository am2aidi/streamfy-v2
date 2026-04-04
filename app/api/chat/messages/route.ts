import { NextResponse } from 'next/server'
import { getSessionTokenFromRequest, getUserBySessionToken } from '@/lib/server/auth-db'
import { listChatMessagesFromDb, sendGroupMessageToDb } from '@/lib/server/platform-db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const roomId = url.searchParams.get('roomId') || 'room-feedback'
  const items = await listChatMessagesFromDb(roomId)
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const body = await req.json()
  const sessionToken = getSessionTokenFromRequest(req)
  const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await sendGroupMessageToDb({
    roomId: String(body?.roomId ?? 'room-feedback'),
    fromUserId: user.id,
    text: String(body?.text ?? ''),
  })
  return NextResponse.json({ ok: true })
}
