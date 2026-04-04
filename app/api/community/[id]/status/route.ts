import { NextResponse } from 'next/server'
import { setCommunityItemStatusInDb } from '@/lib/server/content-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const { id } = await ctx.params
  const body = (await req.json()) as { status?: 'pending' | 'published' | 'rejected' }

  if (!body.status) {
    return NextResponse.json({ error: 'status is required' }, { status: 400 })
  }

  await setCommunityItemStatusInDb(id, body.status)
  return NextResponse.json({ ok: true })
}
