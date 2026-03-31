import { dispatchAppEvent, readJson, subscribeToKey, writeJson } from '@/lib/local-store'

export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'blocked'

export interface PublicUser {
  id: string
  name: string
  username?: string
  email?: string
  phone?: string
  provider?: string
}

export interface StoredUserRecord {
  id: string
  name?: string
  username?: string
  email?: string
  phone?: string
  provider?: string
  password?: string
  role?: UserRole
  status?: UserStatus
  createdAt?: string
}

export interface ManagedUser {
  id: string
  initials: string
  name: string
  username: string
  email: string
  role: 'Admin' | 'User'
  roleKey: UserRole
  joinDate: string
  status: 'Active' | 'Blocked'
  statusKey: UserStatus
  provider: string
}

export interface AdminSession {
  id: string
  email?: string
  name?: string
  username?: string
  role: 'admin'
}

export const USERS_KEY = 'streamfy-users'
export const SESSION_KEY = 'streamfy-auth-session'
export const ADMIN_SESSION_KEY = 'streamfy-admin-session'
const USERS_EVENT_NAME = 'streamfy:users-updated'
const ADMIN_EVENT_NAME = 'streamfy:admin-session-updated'

const SEEDED_ADMIN_ACCOUNT: StoredUserRecord = {
  id: 'u-admin-zaidi',
  name: 'Zaidi Kwizera',
  username: 'zaidikwizera',
  email: 'zaidikwizera@gmail.com',
  password: 'zaidigram2023',
  provider: 'email',
  role: 'admin',
  status: 'active',
  createdAt: '2026-03-31T00:00:00.000Z',
}

function normalizeDate(value?: string) {
  if (!value) return new Date().toISOString()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

function normalizeUser(user: StoredUserRecord, index: number): StoredUserRecord {
  return {
    ...user,
    id: user.id || `u-generated-${index + 1}`,
    role: user.role === 'admin' ? 'admin' : 'user',
    status: user.status === 'blocked' ? 'blocked' : 'active',
    createdAt: normalizeDate(user.createdAt),
  }
}

function ensureSeededAdmin(users: StoredUserRecord[]) {
  const normalized = users.map(normalizeUser)
  const existingIndex = normalized.findIndex(
    (user) => user.email?.toLowerCase() === SEEDED_ADMIN_ACCOUNT.email?.toLowerCase()
  )

  if (existingIndex >= 0) {
    normalized[existingIndex] = {
      ...normalized[existingIndex],
      ...SEEDED_ADMIN_ACCOUNT,
      id: normalized[existingIndex].id || SEEDED_ADMIN_ACCOUNT.id,
      name: normalized[existingIndex].name || SEEDED_ADMIN_ACCOUNT.name,
      username: normalized[existingIndex].username || SEEDED_ADMIN_ACCOUNT.username,
      phone: normalized[existingIndex].phone,
      provider: normalized[existingIndex].provider || SEEDED_ADMIN_ACCOUNT.provider,
      password: SEEDED_ADMIN_ACCOUNT.password,
      role: 'admin',
      status: 'active',
    }
    return normalized
  }

  return [SEEDED_ADMIN_ACCOUNT, ...normalized]
}

function persistUsers(users: StoredUserRecord[]) {
  writeJson(USERS_KEY, users)
  dispatchAppEvent(USERS_EVENT_NAME)
}

function deriveName(user: StoredUserRecord) {
  return (
    (user.name && user.name.trim()) ||
    (user.username ? `@${user.username}` : null) ||
    (user.email ? user.email.split('@')[0] : null) ||
    (user.phone ? `User ${user.phone.slice(-4)}` : null) ||
    'User'
  )
}

function getInitials(value: string) {
  const clean = value.replace(/^@/, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'US'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function getSafeEmail(user: StoredUserRecord) {
  return user.email || (user.phone ? `${user.phone}@phone.streamfy` : 'no-email@streamfy.local')
}

function validateAdminSession(session: AdminSession | null) {
  if (!session?.id) return null
  const user = readStoredUsers([]).find((entry) => entry.id === session.id)
  if (!user || user.role !== 'admin' || user.status !== 'active') {
    clearAdminSession()
    return null
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: 'admin' as const,
  }
}

export function readStoredUsers(fallback: StoredUserRecord[] = []) {
  const raw = readJson<StoredUserRecord[]>(USERS_KEY, fallback)
  const next = ensureSeededAdmin(raw)
  const sameLength = raw.length === next.length
  const sameSerialized = sameLength && JSON.stringify(raw) === JSON.stringify(next)
  if (!sameSerialized) {
    persistUsers(next)
  }
  return next
}

export function writeStoredUsers(users: StoredUserRecord[]) {
  const next = ensureSeededAdmin(users)
  persistUsers(next)
  return next
}

export function getSessionUserId() {
  const session = readJson<{ id?: string } | null>(SESSION_KEY, null)
  return session?.id ?? null
}

export function getUserById(userId: string) {
  return readStoredUsers([]).find((user) => user.id === userId) ?? null
}

export function getUserByEmail(email: string) {
  return readStoredUsers([]).find((user) => user.email?.toLowerCase() === email.trim().toLowerCase()) ?? null
}

export function listPublicUsers(): PublicUser[] {
  return readStoredUsers([])
    .filter((u) => u && typeof u.id === 'string')
    .map((u) => ({
      id: u.id,
      name: deriveName(u),
      username: u.username,
      email: u.email,
      phone: u.phone,
      provider: u.provider,
    }))
}

export function listManagedUsers(): ManagedUser[] {
  return readStoredUsers([])
    .map((user) => {
      const name = deriveName(user)
      return {
        id: user.id,
        initials: getInitials(name),
        name,
        username: user.username || 'no_username',
        email: getSafeEmail(user),
        role: user.role === 'admin' ? 'Admin' : 'User',
        roleKey: user.role === 'admin' ? 'admin' : 'user',
        joinDate: normalizeDate(user.createdAt).slice(0, 10),
        status: user.status === 'blocked' ? 'Blocked' : 'Active',
        statusKey: user.status === 'blocked' ? 'blocked' : 'active',
        provider: user.provider || 'email',
      }
    })
    .sort((a, b) => {
      if (a.roleKey !== b.roleKey) return a.roleKey === 'admin' ? -1 : 1
      return a.joinDate < b.joinDate ? 1 : -1
    })
}

export function countAdmins() {
  return readStoredUsers([]).filter((user) => user.role === 'admin').length
}

export function countActiveAdmins() {
  return readStoredUsers([]).filter((user) => user.role === 'admin' && user.status !== 'blocked').length
}

export function setUserName(userId: string, name: string) {
  const next = readStoredUsers([]).map((user) => (user.id === userId ? { ...user, name } : user))
  writeStoredUsers(next)
}

export function setUserUsername(userId: string, username: string) {
  const next = readStoredUsers([]).map((user) => (user.id === userId ? { ...user, username } : user))
  writeStoredUsers(next)
}

export function setUserRole(userId: string, role: UserRole) {
  const next = readStoredUsers([]).map((user) => (user.id === userId ? { ...user, role } : user))
  writeStoredUsers(next)
}

export function setUserStatus(userId: string, status: UserStatus) {
  const next = readStoredUsers([]).map((user) => (user.id === userId ? { ...user, status } : user))
  writeStoredUsers(next)
}

export function upsertAdminUser(input: {
  name?: string
  username?: string
  email: string
  password: string
}) {
  const email = input.email.trim().toLowerCase()
  const users = readStoredUsers([])
  const existing = users.find((user) => user.email?.toLowerCase() === email)
  const nextUser: StoredUserRecord = {
    id: existing?.id || `u-admin-${Date.now()}`,
    name: input.name?.trim() || existing?.name || email.split('@')[0],
    username: input.username?.trim() || existing?.username || email.split('@')[0],
    email,
    phone: existing?.phone,
    password: input.password.trim(),
    provider: existing?.provider || 'email',
    role: 'admin',
    status: 'active',
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

  const next = existing
    ? users.map((user) => (user.id === existing.id ? nextUser : user))
    : [nextUser, ...users]

  writeStoredUsers(next)
  return nextUser
}

export function createAdminSession(email: string, password: string) {
  const user = readStoredUsers([]).find(
    (entry) =>
      entry.email?.toLowerCase() === email.trim().toLowerCase() &&
      entry.password === password &&
      entry.role === 'admin' &&
      entry.status !== 'blocked'
  )

  if (!user) return null

  const session: AdminSession = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: 'admin',
  }

  writeJson(ADMIN_SESSION_KEY, session)
  dispatchAppEvent(ADMIN_EVENT_NAME)
  return session
}

export function createAdminSessionFromUserId(userId: string | null) {
  if (!userId) return null
  const user = getUserById(userId)
  if (!user || user.role !== 'admin' || user.status !== 'active') return null
  const session: AdminSession = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: 'admin',
  }
  writeJson(ADMIN_SESSION_KEY, session)
  dispatchAppEvent(ADMIN_EVENT_NAME)
  return session
}

export function getAdminSession() {
  const session = readJson<AdminSession | null>(ADMIN_SESSION_KEY, null)
  return validateAdminSession(session)
}

export function clearAdminSession() {
  writeJson(ADMIN_SESSION_KEY, null)
  dispatchAppEvent(ADMIN_EVENT_NAME)
}

export function subscribeToUsers(callback: () => void) {
  return subscribeToKey(USERS_KEY, USERS_EVENT_NAME, callback)
}

export function subscribeToAdminSession(callback: () => void) {
  return subscribeToKey(ADMIN_SESSION_KEY, ADMIN_EVENT_NAME, callback)
}
