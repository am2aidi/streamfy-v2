import { NextResponse } from 'next/server'
import { createSessionForUser, signInUser } from '@/lib/server/auth-db'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | null
    | { identifier?: string; password?: string; countryCode?: string }

  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const result = await signInUser({
    identifier: String(body.identifier ?? ''),
    password: String(body.password ?? ''),
    countryCode: typeof body.countryCode === 'string' ? body.countryCode : undefined,
  })

  if (!result.ok) {
    const status = result.reason === 'blocked' ? 403 : 401
    return NextResponse.json({ error: result.reason }, { status })
  }

  const sessionToken = await createSessionForUser(result.user.id, req)
  return NextResponse.json({ user: result.user, sessionToken })
}
