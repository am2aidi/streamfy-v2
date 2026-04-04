import { NextResponse } from 'next/server'
import { listSportsForAdminFromDb, listSportsMatchesFromDb, upsertSportsMatchInDb } from '@/lib/server/content-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const admin = url.searchParams.get('admin') === '1'

  if (admin) {
    const { response } = await requireAdminUser(req)
    if (response) return response

    const items = (await listSportsForAdminFromDb()).map((item) => ({
      id: item.id,
      sport: item.sport[0]?.toUpperCase() + item.sport.slice(1),
      teamA: item.team_a_name,
      teamALogo: item.team_a_logo_url ?? '',
      teamB: item.team_b_name,
      teamBLogo: item.team_b_logo_url ?? '',
      league: item.league_name,
      leagueLogo: item.league_logo_url ?? '',
      date: item.match_date ?? '',
      status: item.status === 'finished' ? 'Finished' : item.status[0]?.toUpperCase() + item.status.slice(1),
      stream: item.stream_url ?? '',
    }))
    return NextResponse.json({ items })
  }

  const items = await listSportsMatchesFromDb()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const { user, response } = await requireAdminUser(req)
  if (response || !user) return response

  const body = await req.json()
  const id = await upsertSportsMatchInDb({ ...body, createdByUserId: user.id })
  return NextResponse.json({ ok: true, id })
}
