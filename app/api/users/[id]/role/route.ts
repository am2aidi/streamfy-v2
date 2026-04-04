import { NextResponse } from 'next/server'
import { updateUserRoleInDb } from '@/lib/server/platform-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const { id } = await ctx.params
  const body = await req.json()
  const role = body?.role === 'admin' ? 'admin' : 'user'
  await updateUserRoleInDb(id, role)
  return NextResponse.json({ ok: true })
}
