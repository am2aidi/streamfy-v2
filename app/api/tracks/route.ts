import { NextResponse } from 'next/server'
import { listTracksForAdminFromDb, listTracksFromDb, upsertTrackInDb } from '@/lib/server/content-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const admin = url.searchParams.get('admin') === '1'

  if (admin) {
    const { response } = await requireAdminUser(req)
    if (response) return response

    const items = (await listTracksForAdminFromDb()).map((item) => ({
      id: item.id,
      title: item.title,
      artist: item.artist_name,
      genre: item.genre ?? 'Pop',
      duration: item.duration_label ?? '3:00',
      cover: item.cover_url ?? '',
      status: item.status === 'active' ? 'Active' : 'Draft',
    }))
    return NextResponse.json({ items })
  }

  const items = await listTracksFromDb()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const { user, response } = await requireAdminUser(req)
  if (response || !user) return response

  const body = await req.json()
  const id = await upsertTrackInDb({ ...body, createdByUserId: user.id })
  return NextResponse.json({ ok: true, id })
}
