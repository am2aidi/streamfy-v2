import { dispatchAppEvent, readJson, subscribeToKey, writeJson } from '@/lib/local-store'

export type UploadKind = 'movie' | 'music' | 'sports' | 'shorts' | 'news' | 'ad' | 'other'
export type UploadStatus = 'pending' | 'approved' | 'rejected' | 'removed'

export type UploadAttachment = {
  name: string
  size: number
  type: string
}

export type UploadSubmission = {
  id: string
  kind: UploadKind
  title: string
  description: string
  createdAt: string
  createdByUserId: string
  status: UploadStatus
  statusReason?: string
  posterUrl?: string
  attachments?: UploadAttachment[]
  tags?: string[]
}

type StoredUploadSubmission = UploadSubmission

const UPLOADS_KEY = 'streamfy-user-uploads'
const EVENT_NAME = 'streamfy:uploads-updated'

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function sanitizeUpload(input: Omit<UploadSubmission, 'id' | 'createdAt' | 'status'> & Partial<Pick<UploadSubmission, 'status'>>) {
  const title = normalizeText(input.title)
  const description = normalizeText(input.description || '')
  const tags = (input.tags ?? [])
    .map((t) => normalizeText(t))
    .filter(Boolean)
    .slice(0, 20)

  const attachments = (input.attachments ?? [])
    .filter((a) => a && typeof a.name === 'string')
    .map((a) => ({ name: a.name, size: Number(a.size) || 0, type: a.type || '' }))
    .slice(0, 6)

  return {
    kind: input.kind,
    title,
    description,
    posterUrl: input.posterUrl ? normalizeText(input.posterUrl) : undefined,
    createdByUserId: input.createdByUserId,
    tags: tags.length ? tags : undefined,
    attachments: attachments.length ? attachments : undefined,
    status: input.status ?? 'pending',
  }
}

export function listUploads(): UploadSubmission[] {
  return readJson<StoredUploadSubmission[]>(UPLOADS_KEY, [])
    .filter((u) => u && typeof u.id === 'string' && typeof u.title === 'string')
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUploadById(id: string): UploadSubmission | null {
  return listUploads().find((u) => u.id === id) ?? null
}

export function createUpload(input: Omit<UploadSubmission, 'id' | 'createdAt' | 'status'>) {
  const now = new Date().toISOString()
  const base = sanitizeUpload({ ...input, status: 'pending' })
  const next: UploadSubmission = {
    id: uid('upl'),
    createdAt: now,
    status: 'pending',
    ...base,
  }
  const current = readJson<StoredUploadSubmission[]>(UPLOADS_KEY, [])
  writeJson(UPLOADS_KEY, [next, ...current])
  dispatchAppEvent(EVENT_NAME)
  return next
}

export function updateUpload(id: string, patch: Partial<Omit<UploadSubmission, 'id' | 'createdAt' | 'createdByUserId'>>) {
  const current = readJson<StoredUploadSubmission[]>(UPLOADS_KEY, [])
  const next = current.map((u) => {
    if (u.id !== id) return u
    const merged: UploadSubmission = {
      ...u,
      ...patch,
      title: typeof patch.title === 'string' ? normalizeText(patch.title) : u.title,
      description: typeof patch.description === 'string' ? normalizeText(patch.description) : u.description,
      statusReason: typeof patch.statusReason === 'string' ? normalizeText(patch.statusReason) : patch.statusReason === undefined ? u.statusReason : undefined,
    }
    return merged
  })
  writeJson(UPLOADS_KEY, next)
  dispatchAppEvent(EVENT_NAME)
}

export function setUploadStatus(id: string, status: UploadStatus, reason?: string) {
  updateUpload(id, { status, statusReason: reason ? normalizeText(reason) : reason })
}

export function deleteUpload(id: string) {
  const current = readJson<StoredUploadSubmission[]>(UPLOADS_KEY, [])
  const next = current.filter((u) => u.id !== id)
  writeJson(UPLOADS_KEY, next)
  dispatchAppEvent(EVENT_NAME)
}

export function subscribeToUploads(callback: () => void) {
  return subscribeToKey(UPLOADS_KEY, EVENT_NAME, callback)
}

