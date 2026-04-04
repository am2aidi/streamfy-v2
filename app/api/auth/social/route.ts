import { NextResponse } from 'next/server'
import { createSessionForUser, signInWithSocial } from '@/lib/server/auth-db'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | { provider?: string }
  const user = await signInWithSocial((body?.provider || 'gmail') as 'gmail')

  if (!user) return NextResponse.json({ error: 'Unable to continue' }, { status: 500 })

  const sessionToken = await createSessionForUser(user.id, req)
  return NextResponse.json({ user, sessionToken })
}
