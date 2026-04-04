import { NextResponse } from 'next/server'
import { listCommunityLikesFromDb, listCommunityRatingsFromDb, toggleCommunityLikeInDb } from '@/lib/server/content-db'
import { requireSessionUser } from '@/lib/server/route-auth'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireSessionUser(req)
  if (response || !user) return response

  const { id } = await ctx.params
  await req.json().catch(() => null)

  await toggleCommunityLikeInDb(id, user.id)
  const [likes, ratings] = await Promise.all([listCommunityLikesFromDb(), listCommunityRatingsFromDb()])
  return NextResponse.json({ ok: true, likes, ratings })
}
