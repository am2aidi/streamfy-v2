import { NextResponse } from 'next/server'
import { createSessionForUser, signUpUser } from '@/lib/server/auth-db'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | null
    | { name?: string; username?: string; email?: string; phone?: string; password?: string; provider?: string }

  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const result = await signUpUser({
    name: typeof body.name === 'string' ? body.name : undefined,
    username: typeof body.username === 'string' ? body.username : undefined,
    email: typeof body.email === 'string' ? body.email : undefined,
    phone: typeof body.phone === 'string' ? body.phone : undefined,
    password: String(body.password ?? ''),
    provider: body.provider as 'email' | 'gmail' | 'facebook' | 'twitter' | 'pro' | undefined,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 })
  }

  const sessionToken = await createSessionForUser(result.user.id, req)
  return NextResponse.json({ user: result.user, sessionToken })
}
