import { NextResponse } from 'next/server'
import { listAdsCampaignsFromDb, saveAdCampaignToDb } from '@/lib/server/platform-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET() {
  const items = await listAdsCampaignsFromDb()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const body = await req.json()
  const id = await saveAdCampaignToDb({
    id: body?.id,
    banner: String(body?.banner ?? ''),
    advertiser: String(body?.advertiser ?? ''),
    placement: body?.placement,
    start: String(body?.start ?? ''),
    end: String(body?.end ?? ''),
    status: body?.status,
    performance: String(body?.performance ?? '0.0% CTR'),
    creativeUrl: body?.creativeUrl ? String(body.creativeUrl) : undefined,
  })
  return NextResponse.json({ ok: true, id })
}
