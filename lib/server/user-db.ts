import 'server-only'

import { allRows, asBoolean, asString, firstRow, parseJsonArray, runQuery } from '@/lib/server/d1'

type UserSettingsRow = {
  theme: 'dark' | 'light'
  accent_theme: string
  language: 'en' | 'fr' | 'rw'
  audio_quality: string
  subscription_plan: 'movie' | 'day' | 'week' | 'twoWeeks' | 'month'
  payment_method: string
  two_factor: number
  login_notifs: number
  push_notifs: number
  email_notifs: number
  sound_effects: number
  public_profile: number
}

type PersistedAppSettings = {
  theme: 'dark' | 'light'
  accentTheme: string
  language: 'en' | 'fr' | 'rw'
  audioQuality: string
  subscriptionPlan: 'movie' | 'day' | 'week' | 'twoWeeks' | 'month'
  paymentMethod: string
  favoriteLeagues: string[]
  favoriteTracks: string[]
  watchlistMovies: string[]
  watchlistTracks: string[]
  watchlistMatches: string[]
  watchlistShorts: string[]
  twoFactor: boolean
  loginNotifs: boolean
  pushNotifs: boolean
  emailNotifs: boolean
  soundEffects: boolean
}

type ProfileExtras = {
  bio?: string
}

const DEFAULT_SETTINGS: PersistedAppSettings = {
  theme: 'dark',
  accentTheme: 'gold',
  language: 'en',
  audioQuality: 'High',
  subscriptionPlan: 'day',
  paymentMethod: 'rw-mtn-airtel',
  favoriteLeagues: ['Champions League', 'NBA'],
  favoriteTracks: [],
  watchlistMovies: [],
  watchlistTracks: [],
  watchlistMatches: [],
  watchlistShorts: [],
  twoFactor: false,
  loginNotifs: true,
  pushNotifs: true,
  emailNotifs: false,
  soundEffects: true,
}

async function ensureUserSettingsRow(userId: string) {
  await runQuery(
    `
      INSERT OR IGNORE INTO user_settings (
        user_id, theme, accent_theme, language, audio_quality, subscription_plan, payment_method,
        two_factor, login_notifs, push_notifs, email_notifs, sound_effects, public_profile, updated_at
      ) VALUES (?, 'dark', 'gold', 'en', 'High', 'day', 'rw-mtn-airtel', 0, 1, 1, 0, 1, 1, CURRENT_TIMESTAMP)
    `,
    [userId],
  )
}

async function listWatchlistIds(userId: string, type: 'movie' | 'track' | 'match' | 'short') {
  const rows = await allRows<{ item_id: string }>(
    'SELECT item_id FROM watchlist_items WHERE user_id = ? AND item_type = ? ORDER BY created_at DESC',
    [userId, type],
  )
  return rows.map((row) => row.item_id)
}

async function replaceWatchlist(userId: string, type: 'movie' | 'track' | 'match' | 'short', itemIds: string[]) {
  await runQuery('DELETE FROM watchlist_items WHERE user_id = ? AND item_type = ?', [userId, type])
  for (const itemId of itemIds) {
    await runQuery(
      'INSERT INTO watchlist_items (id, user_id, item_type, item_id, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [`watchlist-${crypto.randomUUID()}`, userId, type, itemId],
    )
  }
}

async function getProfileExtras(userId: string): Promise<ProfileExtras> {
  const row = await firstRow<{ value_json: string | null }>('SELECT value_json FROM app_settings WHERE key = ? LIMIT 1', [
    `profile:${userId}`,
  ])
  return row?.value_json ? (JSON.parse(row.value_json) as ProfileExtras) : {}
}

async function saveProfileExtras(userId: string, extras: ProfileExtras) {
  await runQuery(
    `
      INSERT INTO app_settings (key, value_json, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = CURRENT_TIMESTAMP
    `,
    [`profile:${userId}`, JSON.stringify(extras)],
  )
}

export async function getUserSettingsFromDb(userId: string): Promise<PersistedAppSettings> {
  await ensureUserSettingsRow(userId)
  const row = await firstRow<UserSettingsRow>('SELECT * FROM user_settings WHERE user_id = ? LIMIT 1', [userId])
  const favoriteLeagueRows = await allRows<{ league_name: string }>(
    'SELECT league_name FROM favorite_leagues WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
  )
  const favoriteTrackRows = await allRows<{ track_id: string }>(
    'SELECT track_id FROM favorite_tracks WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
  )

  return {
    ...DEFAULT_SETTINGS,
    theme: row?.theme || DEFAULT_SETTINGS.theme,
    accentTheme: asString(row?.accent_theme) || DEFAULT_SETTINGS.accentTheme,
    language: row?.language || DEFAULT_SETTINGS.language,
    audioQuality: asString(row?.audio_quality) || DEFAULT_SETTINGS.audioQuality,
    subscriptionPlan: row?.subscription_plan || DEFAULT_SETTINGS.subscriptionPlan,
    paymentMethod: asString(row?.payment_method) || DEFAULT_SETTINGS.paymentMethod,
    favoriteLeagues: favoriteLeagueRows.map((entry) => entry.league_name),
    favoriteTracks: favoriteTrackRows.map((entry) => entry.track_id),
    watchlistMovies: await listWatchlistIds(userId, 'movie'),
    watchlistTracks: await listWatchlistIds(userId, 'track'),
    watchlistMatches: await listWatchlistIds(userId, 'match'),
    watchlistShorts: await listWatchlistIds(userId, 'short'),
    twoFactor: asBoolean(row?.two_factor),
    loginNotifs: asBoolean(row?.login_notifs),
    pushNotifs: asBoolean(row?.push_notifs),
    emailNotifs: asBoolean(row?.email_notifs),
    soundEffects: asBoolean(row?.sound_effects),
  }
}

export async function saveUserSettingsToDb(userId: string, settings: PersistedAppSettings) {
  await ensureUserSettingsRow(userId)
  await runQuery(
    `
      UPDATE user_settings
      SET
        theme = ?,
        accent_theme = ?,
        language = ?,
        audio_quality = ?,
        subscription_plan = ?,
        payment_method = ?,
        two_factor = ?,
        login_notifs = ?,
        push_notifs = ?,
        email_notifs = ?,
        sound_effects = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
    [
      settings.theme,
      settings.accentTheme,
      settings.language,
      settings.audioQuality,
      settings.subscriptionPlan,
      settings.paymentMethod,
      settings.twoFactor ? 1 : 0,
      settings.loginNotifs ? 1 : 0,
      settings.pushNotifs ? 1 : 0,
      settings.emailNotifs ? 1 : 0,
      settings.soundEffects ? 1 : 0,
      userId,
    ],
  )

  await runQuery('DELETE FROM favorite_leagues WHERE user_id = ?', [userId])
  for (const league of settings.favoriteLeagues) {
    await runQuery(
      'INSERT INTO favorite_leagues (user_id, league_name, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [userId, league],
    )
  }

  await runQuery('DELETE FROM favorite_tracks WHERE user_id = ?', [userId])
  for (const trackId of settings.favoriteTracks) {
    await runQuery(
      'INSERT INTO favorite_tracks (user_id, track_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [userId, trackId],
    )
  }

  await replaceWatchlist(userId, 'movie', settings.watchlistMovies)
  await replaceWatchlist(userId, 'track', settings.watchlistTracks)
  await replaceWatchlist(userId, 'match', settings.watchlistMatches)
  await replaceWatchlist(userId, 'short', settings.watchlistShorts)
}

export async function getUserProfileFromDb(userId: string) {
  const row = await firstRow<{
    id: string
    name: string | null
    username: string | null
    email: string | null
    phone: string | null
    avatar_url: string | null
  }>('SELECT id, name, username, email, phone, avatar_url FROM users WHERE id = ? LIMIT 1', [userId])

  if (!row) return null

  const extras = await getProfileExtras(userId)
  const settingsRow = await firstRow<{ public_profile: number }>(
    'SELECT public_profile FROM user_settings WHERE user_id = ? LIMIT 1',
    [userId],
  )

  return {
    id: row.id,
    fullName: asString(row.name) || '',
    username: asString(row.username) || '',
    email: asString(row.email) || '',
    phone: asString(row.phone) || '',
    avatarUrl: asString(row.avatar_url) || '',
    bio: extras.bio || '',
    publicProfile: settingsRow ? asBoolean(settingsRow.public_profile) : true,
  }
}

export async function saveUserProfileToDb(
  userId: string,
  input: { fullName: string; username: string; email: string; phone: string; bio?: string; publicProfile?: boolean },
) {
  await ensureUserSettingsRow(userId)
  await runQuery(
    `
      UPDATE users
      SET name = ?, username = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [input.fullName.trim(), input.username.trim(), input.email.trim().toLowerCase(), input.phone.trim() || null, userId],
  )

  await runQuery(
    `
      UPDATE user_settings
      SET public_profile = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
    [input.publicProfile === false ? 0 : 1, userId],
  )

  await saveProfileExtras(userId, { bio: input.bio?.trim() || '' })
}

export async function getUserPlaylistsFromDb(userId: string) {
  const playlists = await allRows<{ id: string; name: string }>(
    'SELECT id, name FROM playlists WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
  )
  const items = await allRows<{ playlist_id: string; track_id: string; position: number }>(
    'SELECT playlist_id, track_id, position FROM playlist_items WHERE playlist_id IN (SELECT id FROM playlists WHERE user_id = ?) ORDER BY position ASC, created_at ASC',
    [userId],
  )

  return playlists.map((playlist) => ({
    name: playlist.name,
    tracks: items.filter((item) => item.playlist_id === playlist.id).map((item) => item.track_id),
  }))
}

export async function saveUserPlaylistsToDb(userId: string, playlists: Array<{ name: string; tracks: string[] }>) {
  const existing = await allRows<{ id: string }>('SELECT id FROM playlists WHERE user_id = ?', [userId])
  for (const playlist of existing) {
    await runQuery('DELETE FROM playlist_items WHERE playlist_id = ?', [playlist.id])
  }
  await runQuery('DELETE FROM playlists WHERE user_id = ?', [userId])

  for (const playlist of playlists) {
    const playlistId = `playlist-${crypto.randomUUID()}`
    await runQuery(
      'INSERT INTO playlists (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [playlistId, userId, playlist.name.trim()],
    )
    for (const [index, trackId] of playlist.tracks.entries()) {
      await runQuery(
        'INSERT INTO playlist_items (id, playlist_id, track_id, position, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [`playlist-item-${crypto.randomUUID()}`, playlistId, trackId, index],
      )
    }
  }
}
