import { NextResponse } from 'next/server'
import { deleteShortFromDb, getShortFromDb } from '@/lib/server/content-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const item = await getShortFromDb(id)
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const { id } = await ctx.params
  await deleteShortFromDb(id)
  return NextResponse.json({ ok: true })
}
