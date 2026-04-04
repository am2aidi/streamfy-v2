import 'server-only'

import { getCloudflareContext } from '@opennextjs/cloudflare'

export interface D1StatementLike {
  bind: (...args: unknown[]) => D1StatementLike
  first: <T = Record<string, unknown>>(columnName?: string) => Promise<T | null>
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>
  run: () => Promise<unknown>
}

export interface D1DatabaseLike {
  prepare: (query: string) => D1StatementLike
}

export async function getDb(): Promise<D1DatabaseLike> {
  const { env } = await getCloudflareContext({ async: true })
  const db = (env as { DB?: D1DatabaseLike }).DB

  if (!db) {
    throw new Error('Cloudflare D1 binding "DB" is not available.')
  }

  return db
}

export async function allRows<T>(query: string, params: unknown[] = []) {
  const db = await getDb()
  const result = await db.prepare(query).bind(...params).all<T>()
  return result.results ?? []
}

export async function firstRow<T>(query: string, params: unknown[] = []) {
  const db = await getDb()
  return db.prepare(query).bind(...params).first<T>()
}

export async function runQuery(query: string, params: unknown[] = []) {
  const db = await getDb()
  return db.prepare(query).bind(...params).run()
}

export function asBoolean(value: unknown) {
  return value === 1 || value === true || value === '1'
}

export function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

export function parseJsonArray(value: unknown): string[] {
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}
