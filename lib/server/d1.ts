import 'server-only'

type D1QueryMeta = {
  changed_db?: boolean
  changes?: number
  duration?: number
  last_row_id?: number
  rows_read?: number
  rows_written?: number
  served_by_colo?: string
  served_by_primary?: boolean
  served_by_region?: string
  size_after?: number
  timings?: {
    sql_duration_ms?: number
  }
}

type D1RemoteQueryResult<T> = {
  meta?: D1QueryMeta
  results?: T[]
  success?: boolean
}

type D1RemoteApiResponse<T> = {
  success?: boolean
  errors?: Array<{ message?: string }>
  result?: Array<D1RemoteQueryResult<T>>
}

type RemoteD1Config = {
  accountId: string
  databaseId: string
  apiToken: string
}

export interface D1StatementLike {
  bind: (...args: unknown[]) => D1StatementLike
  first: <T = Record<string, unknown>>(columnName?: string) => Promise<T | null>
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>
  run: () => Promise<unknown>
}

export interface D1DatabaseLike {
  prepare: (query: string) => D1StatementLike
}

function readRemoteD1Config(): RemoteD1Config | null {
  const env = typeof process !== 'undefined' ? process.env : undefined
  const accountId = env?.CLOUDFLARE_ACCOUNT_ID?.trim()
  const databaseId = env?.CLOUDFLARE_D1_DATABASE_ID?.trim()
  const apiToken = (env?.CLOUDFLARE_D1_API_TOKEN || env?.CLOUDFLARE_API_TOKEN)?.trim()

  if (!accountId || !databaseId || !apiToken) return null

  return {
    accountId,
    databaseId,
    apiToken,
  }
}

function serializeD1Param(value: unknown) {
  if (value == null) return null
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'bigint') return value.toString()
  return String(value)
}

async function executeRemoteQuery<T>(config: RemoteD1Config, query: string, params: unknown[]) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.apiToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sql: query,
        params: params.map(serializeD1Param),
      }),
      cache: 'no-store',
    },
  )

  const payload = (await response.json().catch(() => null)) as D1RemoteApiResponse<T> | null

  if (!response.ok || !payload?.success) {
    const errorMessage =
      payload?.errors?.map((entry) => entry.message).filter(Boolean).join('; ') ||
      `Cloudflare D1 API request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  return payload.result?.[0] ?? { results: [], success: true }
}

function createRemoteStatement(config: RemoteD1Config, query: string, params: unknown[] = []): D1StatementLike {
  return {
    bind: (...nextParams: unknown[]) => createRemoteStatement(config, query, nextParams),
    first: async <T = Record<string, unknown>>(columnName?: string) => {
      const result = await executeRemoteQuery<Record<string, unknown>>(config, query, params)
      const row = result.results?.[0]
      if (!row) return null
      return (columnName ? (row[columnName] as T | undefined) ?? null : (row as T)) ?? null
    },
    all: async <T = Record<string, unknown>>() => {
      const result = await executeRemoteQuery<T>(config, query, params)
      return { results: result.results ?? [] }
    },
    run: async () => {
      const result = await executeRemoteQuery<Record<string, unknown>>(config, query, params)
      return result.meta ?? result
    },
  }
}

function createRemoteDatabase(config: RemoteD1Config): D1DatabaseLike {
  return {
    prepare: (query: string) => createRemoteStatement(config, query),
  }
}

async function getBoundDatabase(): Promise<D1DatabaseLike | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = await getCloudflareContext({ async: true })
    return (env as { DB?: D1DatabaseLike }).DB ?? null
  } catch {
    return null
  }
}

export async function getDb(): Promise<D1DatabaseLike> {
  const boundDb = await getBoundDatabase()
  if (boundDb) return boundDb

  const remoteConfig = readRemoteD1Config()
  if (remoteConfig) return createRemoteDatabase(remoteConfig)

  throw new Error(
    'Cloudflare D1 binding "DB" is not available. On Vercel, set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_D1_API_TOKEN.',
  )
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

export function isUniqueConstraintError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.toLowerCase().includes('unique constraint failed')
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
