import { NextResponse } from 'next/server'
import {
  createCommunityItemInDb,
  listCommunityItemsFromDb,
  listCommunityLikesFromDb,
  listCommunityRatingsFromDb,
} from '@/lib/server/content-db'
import { requireSessionUser } from '@/lib/server/route-auth'

export async function GET() {
  const [items, likes, ratings] = await Promise.all([
    listCommunityItemsFromDb(),
    listCommunityLikesFromDb(),
    listCommunityRatingsFromDb(),
  ])

  return NextResponse.json({ items, likes, ratings })
}

export async function POST(req: Request) {
  const { user, response } = await requireSessionUser(req)
  if (response || !user) return response

  const body = await req.json()
  const id = await createCommunityItemInDb({
    ...body,
    createdBy: user.id,
  })
  return NextResponse.json({ ok: true, id })
}
