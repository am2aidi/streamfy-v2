import { NextResponse } from 'next/server'
import { deleteChatMessageFromDb } from '@/lib/server/platform-db'

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  await deleteChatMessageFromDb(id)
  return NextResponse.json({ ok: true })
}
