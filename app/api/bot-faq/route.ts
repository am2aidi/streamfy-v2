import { NextResponse } from 'next/server'
import { listBotFaqEntriesFromPlatformDb, saveBotFaqEntryToDb } from '@/lib/server/platform-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET() {
  const items = await listBotFaqEntriesFromPlatformDb()
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const body = await req.json()
  const items = await listBotFaqEntriesFromPlatformDb()
  const sortOrder = typeof body?.sortOrder === 'number' ? body.sortOrder : items.length + 1
  await saveBotFaqEntryToDb({
    id: String(body?.id ?? `bot-${Date.now()}`),
    title: String(body?.title ?? ''),
    keywords: Array.isArray(body?.keywords) ? body.keywords.map(String) : [],
    responseText: String(body?.responseText ?? ''),
    isActive: body?.isActive !== false,
    sortOrder,
  })
  return NextResponse.json({ ok: true })
}
