import { NextResponse } from 'next/server'
import { updateUserStatusInDb } from '@/lib/server/platform-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const { id } = await ctx.params
  const body = await req.json()
  const status = body?.status === 'blocked' ? 'blocked' : 'active'
  await updateUserStatusInDb(id, status)
  return NextResponse.json({ ok: true })
}
