import { dispatchAppEvent, readJson, subscribeToKey, writeJson } from '@/lib/local-store'

export interface PublicUser {
  id: string
  name: string
  username?: string
  email?: string
  phone?: string
  provider?: string
}

type StoredUserRecord = {
  id: string
  name?: string
  username?: string
  email?: string
  phone?: string
  provider?: string
  password?: string
}

const USERS_KEY = 'streamfy-users'
const SESSION_KEY = 'streamfy-auth-session'
const EVENT_NAME = 'streamfy:users-updated'

export function getSessionUserId() {
  const session = readJson<{ id?: string } | null>(SESSION_KEY, null)
  return session?.id ?? null
}

export function listPublicUsers(): PublicUser[] {
  const stored = readJson<StoredUserRecord[]>(USERS_KEY, [])
  return stored
    .filter((u) => u && typeof u.id === 'string')
    .map((u) => ({
      id: u.id,
      name:
        (u.name && u.name.trim()) ||
        (u.username ? `@${u.username}` : null) ||
        (u.email ? u.email.split('@')[0] : u.phone ? `User ${u.phone.slice(-4)}` : 'User'),
      username: u.username,
      email: u.email,
      phone: u.phone,
      provider: u.provider,
    }))
}

export function setUserName(userId: string, name: string) {
  const next = readJson<StoredUserRecord[]>(USERS_KEY, []).map((u) => (u.id === userId ? { ...u, name } : u))
  writeJson(USERS_KEY, next)
  dispatchAppEvent(EVENT_NAME)
}

export function setUserUsername(userId: string, username: string) {
  const next = readJson<StoredUserRecord[]>(USERS_KEY, []).map((u) => (u.id === userId ? { ...u, username } : u))
  writeJson(USERS_KEY, next)
  dispatchAppEvent(EVENT_NAME)
}

export function subscribeToUsers(callback: () => void) {
  return subscribeToKey(USERS_KEY, EVENT_NAME, callback)
}
