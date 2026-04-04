import { NextResponse } from 'next/server'
import { deleteNewsFromDb } from '@/lib/server/content-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const { id } = await ctx.params
  await deleteNewsFromDb(id)
  return NextResponse.json({ ok: true })
}
