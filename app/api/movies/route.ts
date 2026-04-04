import { NextResponse } from 'next/server'
import { listMoviesForAdminFromDb, listMoviesFromDb, upsertMovieInDb } from '@/lib/server/content-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const admin = url.searchParams.get('admin') === '1'

  if (admin) {
    const { response } = await requireAdminUser(req)
    if (response) return response

    const items = (await listMoviesForAdminFromDb()).map((item) => ({
      id: item.id,
      title: item.title,
      category: item.genre ?? 'Action',
      language: item.language,
      quality: item.duration_label ?? 'HD',
      date: item.created_at.slice(0, 10),
      status: item.status === 'active' ? 'Active' : 'Draft',
      poster: item.poster_url ?? '',
      descriptionHtml: item.description_html ?? '<p></p>',
      createdBy: item.created_by_name ?? 'Admin',
      createdByEmail: item.created_by_email ?? '',
      videoLabel: item.video_url ?? '',
      thumbnailLabel: item.thumbnail_url ?? '',
    }))
    return NextResponse.json({ items })
  }

  const items = await listMoviesFromDb()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const { user, response } = await requireAdminUser(req)
  if (response || !user) return response

  const body = await req.json()
  const id = await upsertMovieInDb({ ...body, createdByUserId: user.id })
  return NextResponse.json({ ok: true, id })
}
