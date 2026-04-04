import { NextResponse } from 'next/server'
import { listCommunityLikesFromDb, listCommunityRatingsFromDb, rateCommunityItemInDb } from '@/lib/server/content-db'
import { requireSessionUser } from '@/lib/server/route-auth'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireSessionUser(req)
  if (response || !user) return response

  const { id } = await ctx.params
  const body = (await req.json()) as { stars?: number }

  if (typeof body.stars !== 'number') {
    return NextResponse.json({ error: 'stars is required' }, { status: 400 })
  }

  await rateCommunityItemInDb(id, user.id, body.stars)
  const [likes, ratings] = await Promise.all([listCommunityLikesFromDb(), listCommunityRatingsFromDb()])
  return NextResponse.json({ ok: true, likes, ratings })
}
