import 'server-only'

import { allRows, asString, firstRow, runQuery } from '@/lib/server/d1'
import type { ClientAuthUser } from '@/lib/auth-client'

type UserRow = {
  id: string
  name: string | null
  username: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  provider: string | null
  role: 'admin' | 'user'
  status: 'active' | 'blocked' | 'deleted'
  password_hash: string | null
}

type SessionRow = {
  id: string
  user_id: string
  session_token: string
  expires_at: string
}

const SEEDED_ADMIN = {
  id: 'u-admin-zaidi',
  name: 'Zaidi Kwizera',
  username: 'zaidikwizera',
  email: 'zaidikwizera@gmail.com',
  password: 'zaidigram2023',
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
}

function mapUser(row: UserRow): ClientAuthUser {
  return {
    id: row.id,
    name: asString(row.name) || undefined,
    username: asString(row.username) || undefined,
    email: asString(row.email) || undefined,
    phone: asString(row.phone) || undefined,
    avatarUrl: asString(row.avatar_url) || undefined,
    provider: (asString(row.provider) || 'email') as ClientAuthUser['provider'],
    role: row.role,
    status: row.status,
  }
}

export async function hashPasswordForStorage(password: string) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false
  if (storedHash === password) return true
  return storedHash === (await hashPasswordForStorage(password))
}

async function ensureUserSettings(userId: string) {
  await runQuery(
    `
      INSERT OR IGNORE INTO user_settings (
        user_id, theme, accent_theme, language, audio_quality, subscription_plan, payment_method
      ) VALUES (?, 'dark', 'gold', 'en', 'High', 'day', 'rw-mtn-airtel')
    `,
    [userId],
  )
}

async function nextAvailableUsername(base: string) {
  const normalizedBase = normalizeUsername(base) || `user${Date.now().toString().slice(-5)}`
  const rows = await allRows<{ username: string | null }>(
    'SELECT username FROM users WHERE username LIKE ? ORDER BY username ASC',
    [`${normalizedBase}%`],
  )
  const taken = new Set(rows.map((row) => asString(row.username)).filter(Boolean))
  if (!taken.has(normalizedBase)) return normalizedBase
  for (let index = 1; index < 10000; index += 1) {
    const candidate = `${normalizedBase}${index}`.slice(0, 20)
    if (!taken.has(candidate)) return candidate
  }
  return `${normalizedBase}${crypto.randomUUID().slice(0, 4)}`.slice(0, 20)
}

export async function ensureSeedAdminUser() {
  const existing = await firstRow<{ id: string }>(
    'SELECT id FROM users WHERE lower(email) = lower(?) LIMIT 1',
    [SEEDED_ADMIN.email],
  )
  const passwordHash = await hashPasswordForStorage(SEEDED_ADMIN.password)

  await runQuery(
    `
      INSERT INTO users (
        id, name, username, email, provider, role, status, password_hash, email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'email', 'admin', 'active', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        username = excluded.username,
        email = excluded.email,
        role = 'admin',
        status = 'active',
        password_hash = excluded.password_hash,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      existing?.id || SEEDED_ADMIN.id,
      SEEDED_ADMIN.name,
      SEEDED_ADMIN.username,
      SEEDED_ADMIN.email,
      passwordHash,
    ],
  )

  await ensureUserSettings(existing?.id || SEEDED_ADMIN.id)
}

export async function getUserBySessionToken(sessionToken: string) {
  await ensureSeedAdminUser()
  await runQuery('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP')

  const row = await firstRow<UserRow & SessionRow>(
    `
      SELECT u.*, s.id as session_id, s.user_id, s.session_token, s.expires_at
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `,
    [sessionToken],
  )

  if (!row || row.status === 'deleted') return null

  await runQuery('UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE session_token = ?', [sessionToken])
  return mapUser(row)
}

export async function createSessionForUser(userId: string, req?: Request) {
  const token = crypto.randomUUID()
  await runQuery(
    `
      INSERT INTO sessions (
        id, user_id, session_token, device_name, ip_address, user_agent, expires_at, last_seen_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime(CURRENT_TIMESTAMP, '+30 days'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      uid('session'),
      userId,
      token,
      'Web Browser',
      null,
      req?.headers.get('user-agent') || null,
    ],
  )
  return token
}

export async function deleteSessionByToken(sessionToken: string) {
  await runQuery('DELETE FROM sessions WHERE session_token = ?', [sessionToken])
}

export async function signInUser(input: { identifier: string; password: string; countryCode?: string }) {
  await ensureSeedAdminUser()
  const identifier = input.identifier.trim()
  const phoneCandidate =
    identifier.includes('@')
      ? null
      : identifier.startsWith('+')
        ? identifier
        : `${input.countryCode || '+250'}${identifier.replace(/\D/g, '')}`

  const user = await firstRow<UserRow>(
    `
      SELECT *
      FROM users
      WHERE lower(email) = lower(?)
         OR phone = ?
      LIMIT 1
    `,
    [identifier, phoneCandidate],
  )

  if (!user) return { ok: false as const, reason: 'invalid' as const }
  if (user.status === 'blocked' || user.status === 'deleted') return { ok: false as const, reason: 'blocked' as const }
  if (!(await verifyPassword(input.password.trim(), user.password_hash))) {
    return { ok: false as const, reason: 'invalid' as const }
  }

  return { ok: true as const, user: mapUser(user) }
}

export async function signUpUser(input: {
  name?: string
  username?: string
  email?: string
  phone?: string
  password: string
  provider?: ClientAuthUser['provider']
}) {
  await ensureSeedAdminUser()
  const email = input.email?.trim().toLowerCase() || null
  const phone = input.phone?.trim() || null
  const username = input.username?.trim() || input.email?.split('@')[0] || input.name || 'user'

  if (!email && !phone) return { ok: false as const, reason: 'missing_contact' as const }
  if (input.password.trim().length < 6) return { ok: false as const, reason: 'weak_password' as const }

  const conflict = await firstRow<{ id: string; email: string | null; phone: string | null; username: string | null }>(
    `
      SELECT id, email, phone, username
      FROM users
      WHERE (lower(email) = lower(?) AND ? IS NOT NULL)
         OR (phone = ? AND ? IS NOT NULL)
         OR (lower(username) = lower(?) AND ? IS NOT NULL)
      LIMIT 1
    `,
    [email, email, phone, phone, username.trim() || null, username.trim() || null],
  )

  if (conflict) return { ok: false as const, reason: 'exists' as const }

  const userId = uid('user')
  const safeUsername = await nextAvailableUsername(username)
  const passwordHash = await hashPasswordForStorage(input.password.trim())

  await runQuery(
    `
      INSERT INTO users (
        id, name, username, email, phone, provider, role, status, password_hash, email_verified, phone_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'user', 'active', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      userId,
      input.name?.trim() || safeUsername,
      safeUsername,
      email,
      phone,
      input.provider || 'email',
      email ? 1 : 0,
      phone ? 1 : 0,
      passwordHash,
    ],
  )
  await ensureUserSettings(userId)

  const created = await firstRow<UserRow>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId])
  if (!created) return { ok: false as const, reason: 'invalid' as const }
  return { ok: true as const, user: mapUser(created) }
}

export async function signInWithSocial(provider: ClientAuthUser['provider']) {
  await ensureSeedAdminUser()
  const socialEmail = 'joe.don@example.com'
  const existing = await firstRow<UserRow>('SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1', [socialEmail])
  if (existing) return mapUser(existing)

  const userId = uid('user')
  const username = await nextAvailableUsername('joe_don')
  await runQuery(
    `
      INSERT INTO users (
        id, name, username, email, provider, role, status, password_hash, email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'user', 'active', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [userId, 'Joe Don', username, socialEmail, provider || 'gmail', await hashPasswordForStorage('oauth')],
  )
  await ensureUserSettings(userId)
  const created = await firstRow<UserRow>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId])
  return created ? mapUser(created) : null
}

export function getSessionTokenFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim()

  const sessionToken = req.headers.get('x-session-token')
  if (sessionToken) return sessionToken.trim()

  const url = new URL(req.url)
  return url.searchParams.get('sessionToken')?.trim() || null
}
