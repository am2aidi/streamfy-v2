import { NextResponse } from 'next/server'
import { listAdminUsersFromDb, upsertAdminUserInDb } from '@/lib/server/platform-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET(req: Request) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const items = await listAdminUsersFromDb()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const body = await req.json()
  const id = await upsertAdminUserInDb({
    name: body?.name,
    username: body?.username,
    email: String(body?.email ?? ''),
    password: String(body?.password ?? ''),
  })
  return NextResponse.json({ ok: true, id })
}
