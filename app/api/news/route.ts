import { NextResponse } from 'next/server'
import { listNewsFromDb, upsertNewsInDb } from '@/lib/server/content-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET() {
  const items = await listNewsFromDb()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const { user, response } = await requireAdminUser(req)
  if (response || !user) return response

  const body = await req.json()
  const id = await upsertNewsInDb({ ...body, createdByUserId: user.id })
  return NextResponse.json({ ok: true, id })
}
