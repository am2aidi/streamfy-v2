import { canUseDOM, dispatchAppEvent, readJson, subscribeToKey, writeJson } from '@/lib/local-store'

export type AuthRole = 'admin' | 'user'
export type AuthStatus = 'active' | 'blocked' | 'deleted'

export interface ClientAuthUser {
  id: string
  name?: string
  username?: string
  email?: string
  phone?: string
  avatarUrl?: string
  provider?: 'email' | 'gmail' | 'facebook' | 'twitter' | 'pro'
  role?: AuthRole
  status?: AuthStatus
}

export interface StoredAuthSession {
  token: string
  user: ClientAuthUser
}

export const AUTH_SESSION_KEY = 'streamfy-auth-session-v2'
export const LEGACY_AUTH_SESSION_KEY = 'streamfy-auth-session'
export const LEGACY_AUTH_FLAG_KEY = 'streamfy-session'
export const ADMIN_SESSION_KEY = 'streamfy-admin-session'
export const AUTH_EVENT_NAME = 'streamfy:auth-session-updated'
export const ADMIN_EVENT_NAME = 'streamfy:admin-session-updated'

function toAdminSession(user: ClientAuthUser) {
  if (user.role !== 'admin' || user.status === 'blocked' || user.status === 'deleted') return null
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: 'admin' as const,
  }
}

export function readStoredAuthSession() {
  return readJson<StoredAuthSession | null>(AUTH_SESSION_KEY, null)
}

export function getStoredAuthToken() {
  return readStoredAuthSession()?.token ?? null
}

export function writeStoredAuthSession(session: StoredAuthSession) {
  writeJson(AUTH_SESSION_KEY, session)
  writeJson(LEGACY_AUTH_SESSION_KEY, session.user)
  if (canUseDOM()) {
    window.localStorage.setItem(LEGACY_AUTH_FLAG_KEY, 'active')
  }

  const adminSession = toAdminSession(session.user)
  writeJson(ADMIN_SESSION_KEY, adminSession)
  dispatchAppEvent(AUTH_EVENT_NAME)
  dispatchAppEvent(ADMIN_EVENT_NAME)
}

export function patchStoredAuthUser(patch: Partial<ClientAuthUser>) {
  const current = readStoredAuthSession()
  if (!current) return
  writeStoredAuthSession({
    ...current,
    user: {
      ...current.user,
      ...patch,
    },
  })
}

export function clearStoredAuthSession() {
  writeJson(AUTH_SESSION_KEY, null)
  writeJson(LEGACY_AUTH_SESSION_KEY, null)
  writeJson(ADMIN_SESSION_KEY, null)
  if (canUseDOM()) {
    window.localStorage.removeItem(LEGACY_AUTH_FLAG_KEY)
  }
  dispatchAppEvent(AUTH_EVENT_NAME)
  dispatchAppEvent(ADMIN_EVENT_NAME)
}

export function getStoredAdminSession() {
  return readJson<ReturnType<typeof toAdminSession> | null>(ADMIN_SESSION_KEY, null)
}

export function subscribeToAuthSession(callback: () => void) {
  return subscribeToKey(AUTH_SESSION_KEY, AUTH_EVENT_NAME, callback)
}

export function subscribeToAdminSession(callback: () => void) {
  return subscribeToKey(ADMIN_SESSION_KEY, ADMIN_EVENT_NAME, callback)
}

export function authHeaders() {
  const token = getStoredAuthToken()
  const headers: Record<string, string> = {}
  if (token) headers['x-session-token'] = token
  return headers
}
