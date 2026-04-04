import { NextResponse } from 'next/server'
import {
  getPlatformSettingsFromDb,
  saveFilterOptionsToDb,
  savePaymentMethodsToDb,
  savePlaylistPresetsToDb,
  saveSocialLinksToDb,
  saveTranslationOverrideToDb,
} from '@/lib/server/platform-db'
import { requireAdminUser } from '@/lib/server/route-auth'

export async function GET() {
  const settings = await getPlatformSettingsFromDb()
  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const { response } = await requireAdminUser(req)
  if (response) return response

  const body = await req.json()
  const section = String(body?.section ?? '')

  if (section === 'socialLinks') {
    await saveSocialLinksToDb(body.items ?? [])
    return NextResponse.json({ ok: true })
  }

  if (section === 'paymentMethods') {
    await savePaymentMethodsToDb(body.items ?? [])
    return NextResponse.json({ ok: true })
  }

  if (section === 'filterOptions') {
    await saveFilterOptionsToDb(body.items ?? { movies: [], music: [], sports: [] })
    return NextResponse.json({ ok: true })
  }

  if (section === 'playlistPresets') {
    await savePlaylistPresetsToDb((body.items ?? []).map((name: string) => ({ name })))
    return NextResponse.json({ ok: true })
  }

  if (section === 'translationOverride') {
    await saveTranslationOverrideToDb(body.language, body.key, body.value)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
}
