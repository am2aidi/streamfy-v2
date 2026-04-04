import 'server-only'

import { hashPasswordForStorage } from '@/lib/server/auth-db'
import { allRows, asBoolean, asNumber, asString, firstRow, parseJsonArray, runQuery } from '@/lib/server/d1'

export type SocialLinkRecord = { name: 'TikTok' | 'WhatsApp' | 'YouTube'; url: string; enabled: boolean }
export type PaymentMethodRecord = { id: string; label: string; enabled: boolean; feePercent: number }
export type FilterSection = 'movies' | 'music' | 'sports'
export type FilterOptionsRecord = Record<FilterSection, string[]>
export type PlaylistPresetRecord = { id: string; name: string; sortOrder: number; isActive: boolean }
export type TranslationOverridesRecord = Partial<Record<'en' | 'fr' | 'rw', Record<string, string>>>
export type BotFaqEntryRecord = { id: string; title: string; keywords: string[]; responseText: string; isActive: boolean; sortOrder: number }
export type AdCampaignRecord = {
  id: string
  banner: string
  advertiser: string
  placement: 'Home' | 'Movie' | 'Sport' | 'Music'
  start: string
  end: string
  status: 'Active' | 'Paused' | 'Completed'
  performance: string
  creativeUrl?: string
}

type ChatRoomRow = {
  id: string
  slug: string
  name: string
  description: string | null
  is_anonymous: number
  retention_days: number
}

type ChatMessageRow = {
  id: string
  room_id: string | null
  thread_id: string
  from_user_id: string
  to_user_id: string | null
  text: string
  created_at: string
  expires_at: string | null
  sender_name?: string | null
}

type AdminUserRow = {
  id: string
  name: string | null
  username: string | null
  email: string | null
  provider: string | null
  role: string
  status: string
  created_at: string
}

export type ChatRoomRecord = {
  id: string
  slug: string
  name: string
  description: string
  isAnonymous: boolean
  retentionDays: number
}

export type ChatMessageRecord = {
  id: string
  roomId: string
  threadId: string
  fromUserId: string
  text: string
  createdAt: string
  expiresAt: string
  senderName?: string
}

export type AdminUserRecord = {
  id: string
  initials: string
  name: string
  username: string
  email: string
  role: 'Admin' | 'User'
  roleKey: 'admin' | 'user'
  joinDate: string
  status: 'Active' | 'Blocked'
  statusKey: 'active' | 'blocked'
  provider: string
}

const CHAT_RETENTION_DAYS = 30

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function initialism(value: string) {
  const clean = value.replace(/^@/, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'US'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function deriveUserName(row: AdminUserRow) {
  return asString(row.name) || asString(row.username) || asString(row.email)?.split('@')[0] || 'User'
}

function deriveUserEmail(row: AdminUserRow) {
  return asString(row.email) || 'no-email@streamfy.local'
}

async function ensureChatRoomsConfigured() {
  await runQuery(
    `
      INSERT OR IGNORE INTO chat_rooms (id, slug, name, description, is_anonymous, retention_days)
      VALUES ('room-feedback', 'feedback', 'Feedback Room', 'Share ideas, report issues, and request features.', 1, ?)
    `,
    [CHAT_RETENTION_DAYS],
  )
  await runQuery(
    `
      UPDATE chat_rooms
      SET retention_days = ?, description = 'Share ideas, report issues, and request features.'
      WHERE id = 'room-feedback'
    `,
    [CHAT_RETENTION_DAYS],
  )
}

export async function listSocialLinksFromDb() {
  const rows = await allRows<{ name: string; url: string; enabled: number }>('SELECT * FROM social_links ORDER BY name ASC')
  return rows.map((row) => ({ name: row.name as SocialLinkRecord['name'], url: row.url, enabled: asBoolean(row.enabled) }))
}

export async function saveSocialLinksToDb(links: SocialLinkRecord[]) {
  for (const link of links) {
    await runQuery(
      `
        INSERT INTO social_links (name, url, enabled, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(name) DO UPDATE SET
          url = excluded.url,
          enabled = excluded.enabled,
          updated_at = CURRENT_TIMESTAMP
      `,
      [link.name, link.url.trim(), link.enabled ? 1 : 0],
    )
  }
}

export async function listPaymentMethodsFromDb() {
  const rows = await allRows<{ id: string; label: string; enabled: number; fee_percent: number }>(
    'SELECT * FROM payment_methods ORDER BY label ASC',
  )
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    enabled: asBoolean(row.enabled),
    feePercent: asNumber(row.fee_percent),
  }))
}

export async function savePaymentMethodsToDb(methods: PaymentMethodRecord[]) {
  for (const method of methods) {
    await runQuery(
      `
        INSERT INTO payment_methods (id, label, enabled, fee_percent, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          label = excluded.label,
          enabled = excluded.enabled,
          fee_percent = excluded.fee_percent,
          updated_at = CURRENT_TIMESTAMP
      `,
      [method.id, method.label.trim(), method.enabled ? 1 : 0, method.feePercent],
    )
  }
}

export async function listFilterOptionsFromDb(): Promise<FilterOptionsRecord> {
  const rows = await allRows<{ section: FilterSection; value: string }>(
    'SELECT section, value FROM filter_options ORDER BY section ASC, sort_order ASC, value ASC',
  )
  return {
    movies: rows.filter((row) => row.section === 'movies').map((row) => row.value),
    music: rows.filter((row) => row.section === 'music').map((row) => row.value),
    sports: rows.filter((row) => row.section === 'sports').map((row) => row.value),
  }
}

export async function saveFilterOptionsToDb(filters: FilterOptionsRecord) {
  const sections: FilterSection[] = ['movies', 'music', 'sports']
  for (const section of sections) {
    await runQuery('DELETE FROM filter_options WHERE section = ?', [section])
    for (const [index, value] of filters[section].entries()) {
      await runQuery(
        'INSERT INTO filter_options (id, section, value, sort_order) VALUES (?, ?, ?, ?)',
        [uid(`filter-${section}`), section, value.trim(), index + 1],
      )
    }
  }
}

export async function listPlaylistPresetsFromDb() {
  const rows = await allRows<{ id: string; name: string; sort_order: number; is_active: number }>(
    'SELECT * FROM playlist_presets ORDER BY sort_order ASC, name ASC',
  )
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: asNumber(row.sort_order),
    isActive: asBoolean(row.is_active),
  }))
}

export async function savePlaylistPresetsToDb(presets: { name: string }[]) {
  await runQuery('DELETE FROM playlist_presets')
  for (const [index, preset] of presets.entries()) {
    await runQuery(
      'INSERT INTO playlist_presets (id, name, sort_order, is_active) VALUES (?, ?, ?, 1)',
      [uid('preset'), preset.name.trim(), index + 1],
    )
  }
}

export async function listTranslationOverridesFromDb(): Promise<TranslationOverridesRecord> {
  const rows = await allRows<{ language: 'en' | 'fr' | 'rw'; translation_key: string; value: string }>(
    'SELECT language, translation_key, value FROM translation_overrides ORDER BY language ASC, translation_key ASC',
  )
  return rows.reduce<TranslationOverridesRecord>((acc, row) => {
    const bucket = acc[row.language] ?? {}
    bucket[row.translation_key] = row.value
    acc[row.language] = bucket
    return acc
  }, {})
}

export async function saveTranslationOverrideToDb(language: 'en' | 'fr' | 'rw', key: string, value: string) {
  await runQuery(
    `
      INSERT INTO translation_overrides (language, translation_key, value, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(language, translation_key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `,
    [language, key, value.trim()],
  )
}

export async function listBotFaqEntriesFromPlatformDb() {
  const rows = await allRows<{ id: string; title: string; keywords_json: string; response_text: string; is_active: number; sort_order: number }>(
    'SELECT * FROM bot_faq_entries ORDER BY sort_order ASC, created_at ASC',
  )
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    keywords: parseJsonArray(row.keywords_json),
    responseText: row.response_text,
    isActive: asBoolean(row.is_active),
    sortOrder: asNumber(row.sort_order),
  }))
}

export async function saveBotFaqEntryToDb(entry: BotFaqEntryRecord) {
  await runQuery(
    `
      INSERT INTO bot_faq_entries (id, title, keywords_json, response_text, is_active, sort_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        keywords_json = excluded.keywords_json,
        response_text = excluded.response_text,
        is_active = excluded.is_active,
        sort_order = excluded.sort_order,
        updated_at = CURRENT_TIMESTAMP
    `,
    [entry.id, entry.title.trim(), JSON.stringify(entry.keywords), entry.responseText.trim(), entry.isActive ? 1 : 0, entry.sortOrder],
  )
}

export async function deleteBotFaqEntryFromDb(id: string) {
  await runQuery('DELETE FROM bot_faq_entries WHERE id = ?', [id])
}

export async function listAdsCampaignsFromDb() {
  const rows = await allRows<{
    id: string
    banner_name: string
    advertiser: string
    placement: string
    start_date: string
    end_date: string
    status: string
    performance_text: string | null
    creative_url: string | null
  }>('SELECT * FROM ads_campaigns ORDER BY start_date DESC, created_at DESC')

  return rows.map((row) => ({
    id: row.id,
    banner: row.banner_name,
    advertiser: row.advertiser,
    placement: (row.placement[0]?.toUpperCase() + row.placement.slice(1)) as AdCampaignRecord['placement'],
    start: row.start_date,
    end: row.end_date,
    status: (row.status[0]?.toUpperCase() + row.status.slice(1)) as AdCampaignRecord['status'],
    performance: row.performance_text ?? '0.0% CTR',
    creativeUrl: row.creative_url ?? undefined,
  }))
}

export async function saveAdCampaignToDb(ad: AdCampaignRecord) {
  const id = ad.id?.trim() || uid('ad')
  await runQuery(
    `
      INSERT INTO ads_campaigns (
        id, banner_name, advertiser, placement, start_date, end_date, status, performance_text, creative_url, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        banner_name = excluded.banner_name,
        advertiser = excluded.advertiser,
        placement = excluded.placement,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        status = excluded.status,
        performance_text = excluded.performance_text,
        creative_url = excluded.creative_url,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      id,
      ad.banner.trim(),
      ad.advertiser.trim(),
      ad.placement.toLowerCase(),
      ad.start,
      ad.end,
      ad.status.toLowerCase(),
      ad.performance.trim(),
      ad.creativeUrl?.trim() || null,
    ],
  )
  return id
}

export async function deleteAdCampaignFromDb(id: string) {
  await runQuery('DELETE FROM ads_campaigns WHERE id = ?', [id])
}

export async function listAdminUsersFromDb() {
  const rows = await allRows<AdminUserRow>('SELECT id, name, username, email, provider, role, status, created_at FROM users ORDER BY created_at DESC')
  return rows.map((row) => {
    const name = deriveUserName(row)
    return {
      id: row.id,
      initials: initialism(name),
      name,
      username: asString(row.username) || 'no_username',
      email: deriveUserEmail(row),
      role: row.role === 'admin' ? 'Admin' : 'User',
      roleKey: row.role === 'admin' ? 'admin' : 'user',
      joinDate: asString(row.created_at)?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      status: row.status === 'blocked' ? 'Blocked' : 'Active',
      statusKey: row.status === 'blocked' ? 'blocked' : 'active',
      provider: asString(row.provider) || 'email',
    } satisfies AdminUserRecord
  })
}

export async function updateUserRoleInDb(userId: string, role: 'admin' | 'user') {
  await runQuery('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, userId])
}

export async function updateUserStatusInDb(userId: string, status: 'active' | 'blocked') {
  await runQuery('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, userId])
}

export async function upsertAdminUserInDb(input: { name?: string; username?: string; email: string; password: string }) {
  const existing = await firstRow<{ id: string }>('SELECT id FROM users WHERE lower(email) = lower(?) LIMIT 1', [input.email.trim()])
  const id = existing?.id || uid('admin')
  const username = input.username?.trim() || input.email.trim().split('@')[0]
  const passwordHash = await hashPasswordForStorage(input.password.trim())
  await runQuery(
    `
      INSERT INTO users (id, name, username, email, provider, role, status, password_hash, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'email', 'admin', 'active', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        username = excluded.username,
        email = excluded.email,
        role = 'admin',
        status = 'active',
        password_hash = excluded.password_hash,
        updated_at = CURRENT_TIMESTAMP
    `,
    [id, input.name?.trim() || username, username, input.email.trim().toLowerCase(), passwordHash],
  )
  return id
}

export async function listChatRoomsFromDb() {
  await ensureChatRoomsConfigured()
  const rows = await allRows<ChatRoomRow>('SELECT * FROM chat_rooms ORDER BY created_at ASC')
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: asString(row.description) || '',
    isAnonymous: asBoolean(row.is_anonymous),
    retentionDays: asNumber(row.retention_days, CHAT_RETENTION_DAYS),
  }))
}

async function cleanupExpiredChatMessages() {
  await runQuery(
    `
      DELETE FROM chat_messages
      WHERE expires_at IS NOT NULL AND expires_at <= CURRENT_TIMESTAMP
    `,
  )
}

export async function listChatMessagesFromDb(roomId: string) {
  await ensureChatRoomsConfigured()
  await cleanupExpiredChatMessages()
  const rows = await allRows<ChatMessageRow>(
    `
      SELECT cm.*, u.name as sender_name
      FROM chat_messages cm
      LEFT JOIN users u ON u.id = cm.from_user_id
      WHERE cm.room_id = ? AND cm.is_deleted = 0 AND (cm.expires_at IS NULL OR cm.expires_at > CURRENT_TIMESTAMP)
      ORDER BY cm.created_at ASC
    `,
    [roomId],
  )
  return rows.map((row) => ({
    id: row.id,
    roomId: row.room_id || roomId,
    threadId: row.thread_id,
    fromUserId: row.from_user_id,
    text: row.text,
    createdAt: row.created_at,
    expiresAt: row.expires_at || new Date(Date.now() + CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    senderName: asString(row.sender_name) || undefined,
  }))
}

export async function sendGroupMessageToDb(input: { roomId: string; fromUserId: string; text: string }) {
  await ensureChatRoomsConfigured()
  const room = await firstRow<ChatRoomRow>('SELECT * FROM chat_rooms WHERE id = ? OR slug = ? LIMIT 1', [input.roomId, input.roomId])
  const resolvedRoomId = room?.id || 'room-feedback'
  const threadId = `room__${room?.slug || 'feedback'}`
  const retentionDays = asNumber(room?.retention_days, CHAT_RETENTION_DAYS)

  await runQuery(
    `
      INSERT INTO chat_messages (id, room_id, thread_id, from_user_id, to_user_id, text, is_deleted, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, datetime(CURRENT_TIMESTAMP, '+' || ? || ' days'), CURRENT_TIMESTAMP)
    `,
    [uid('chat'), resolvedRoomId, threadId, input.fromUserId, room?.slug || 'feedback', input.text.trim(), retentionDays],
  )
}

export async function deleteChatMessageFromDb(id: string) {
  await runQuery('UPDATE chat_messages SET is_deleted = 1 WHERE id = ?', [id])
}

export async function getPlatformSettingsFromDb() {
  const [socialLinks, paymentMethods, filterOptions, playlistPresets, translationOverrides] = await Promise.all([
    listSocialLinksFromDb(),
    listPaymentMethodsFromDb(),
    listFilterOptionsFromDb(),
    listPlaylistPresetsFromDb(),
    listTranslationOverridesFromDb(),
  ])

  return {
    socialLinks,
    paymentMethods,
    filterOptions,
    playlistPresets,
    translationOverrides,
  }
}
