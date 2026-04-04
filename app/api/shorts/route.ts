import { NextResponse } from 'next/server'
import { listShortsFromDb, upsertShortInDb } from '@/lib/server/content-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET() {
  const items = await listShortsFromDb()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const { user, response } = await requireAdminUser(req)
  if (response || !user) return response

  const body = await req.json()
  const id = await upsertShortInDb({ ...body, createdByUserId: user.id })
  return NextResponse.json({ ok: true, id })
}
