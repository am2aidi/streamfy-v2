import { NextResponse } from 'next/server'
import { deleteBotFaqEntryFromDb } from '@/lib/server/platform-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const { id } = await ctx.params
  await deleteBotFaqEntryFromDb(id)
  return NextResponse.json({ ok: true })
}
