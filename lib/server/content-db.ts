import 'server-only'

import type { CommunityItem, CommunityLike, CommunityRating, CommunityStatus } from '@/lib/community-store'
import { movieCards, type MovieItem } from '@/lib/movies-data'
import { musicTracks, type MusicTrack } from '@/lib/music-data'
import { newsItems as seedNewsItems, type NewsItem } from '@/lib/news-data'
import { shortVideos, type ShortVideo } from '@/lib/shorts-data'
import { getAllMatches, type SportsMatch, type SportsTab } from '@/lib/sports-data'
import { allRows, asBoolean, asNumber, asString, firstRow, parseJsonArray, runQuery } from '@/lib/server/d1'

const DEFAULT_ADMIN_ID = 'u-admin-zaidi'

const seedUsers = [
  {
    id: DEFAULT_ADMIN_ID,
    name: 'Zaidi Kwizera',
    username: 'zaidikwizera',
    email: 'zaidikwizera@gmail.com',
    phone: null,
    provider: 'email',
    role: 'admin',
    status: 'active',
    passwordHash: 'dev-admin-password',
  },
  {
    id: 'u-demo',
    name: 'Joe Don',
    username: 'joe_don',
    email: 'joe.don@example.com',
    phone: null,
    provider: 'email',
    role: 'user',
    status: 'active',
    passwordHash: 'dev-demo-password',
  },
  {
    id: 'u-alina',
    name: 'Alina',
    username: 'alina',
    email: 'alina@example.com',
    phone: null,
    provider: 'email',
    role: 'user',
    status: 'active',
    passwordHash: 'dev-demo-password',
  },
  {
    id: 'u-musa',
    name: 'Musa',
    username: 'musa',
    email: 'musa@example.com',
    phone: null,
    provider: 'email',
    role: 'user',
    status: 'active',
    passwordHash: 'dev-demo-password',
  },
  {
    id: 'u-ken',
    name: 'Ken',
    username: 'ken',
    email: 'ken@example.com',
    phone: null,
    provider: 'email',
    role: 'user',
    status: 'active',
    passwordHash: 'dev-demo-password',
  },
  {
    id: 'u-support',
    name: 'Streamfy Support',
    username: 'streamfy_support',
    email: 'support@streamfy.io',
    phone: null,
    provider: 'email',
    role: 'user',
    status: 'active',
    passwordHash: 'dev-demo-password',
  },
]

type MovieRow = {
  id: string
  title: string
  subtitle: string | null
  description: string
  description_html: string | null
  poster_url: string | null
  thumbnail_url: string | null
  trailer_url: string | null
  video_url: string | null
  duration_label: string | null
  duration_seconds: number | null
  year: number | null
  rating: number | null
  genre: string | null
  type: MovieItem['type']
  language: MovieItem['language']
  featured: number
  status: string
  created_by_user_id: string | null
  created_at: string
  updated_at: string
  created_by_name?: string | null
  created_by_email?: string | null
}

type TrackRow = {
  id: string
  title: string
  artist_name: string
  album_name: string | null
  cover_url: string | null
  genre: string | null
  duration_label: string | null
  duration_seconds: number | null
  audio_url: string | null
  preview_url: string | null
  popularity: number | null
  release_date: string | null
  lyrics: string | null
  status: string
  created_at: string
  updated_at: string
}

type ShortRow = {
  id: string
  title: string
  category: ShortVideo['category']
  duration_seconds: number
  image_url: string
  video_url: string | null
  caption: string | null
  status: string
  created_at: string
  updated_at: string
}

type SportsRow = {
  id: string
  sport: string
  league_name: string
  league_color: string | null
  league_logo_url: string | null
  team_a_name: string
  team_a_logo_url: string | null
  team_a_record: string | null
  team_b_name: string
  team_b_logo_url: string | null
  team_b_record: string | null
  match_time_label: string | null
  match_date: string | null
  status: string
  score_a: number | null
  score_b: number | null
  stream_url: string | null
  hero_image_url: string | null
  starred: number
  created_at: string
  updated_at: string
}

type NewsRow = {
  id: string
  title: string
  category: NewsItem['category']
  summary: string
  content: string | null
  source: string
  time_label: string | null
  image_url: string
  source_url: string | null
  video_url: string | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

type CommunityItemRow = {
  id: string
  kind: CommunityItem['kind']
  title: string
  description: string | null
  image_url: string
  trailer_url: string | null
  status: CommunityItem['status']
  created_by_user_id: string
  created_at: string
  created_by_name?: string | null
  created_by_email?: string | null
}

let seedPromise: Promise<void> | null = null

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

async function ensureUsersSeeded() {
  const count = await firstRow<{ count: number }>('SELECT COUNT(*) as count FROM users')
  if (asNumber(count?.count) > 0) return

  for (const user of seedUsers) {
    await runQuery(
      `
        INSERT OR IGNORE INTO users (
          id, name, username, email, phone, provider, role, status, password_hash, email_verified, phone_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
      `,
      [user.id, user.name, user.username, user.email, user.phone, user.provider, user.role, user.status, user.passwordHash],
    )

    await runQuery(
      `
        INSERT OR IGNORE INTO user_settings (
          user_id, theme, accent_theme, language, audio_quality, subscription_plan, payment_method
        ) VALUES (?, 'dark', 'gold', 'en', 'High', 'day', 'rw-mtn-airtel')
      `,
      [user.id],
    )
  }
}

async function ensureMoviesSeeded() {
  const count = await firstRow<{ count: number }>('SELECT COUNT(*) as count FROM movies')
  if (asNumber(count?.count) > 0) return

  for (const movie of movieCards) {
    await runQuery(
      `
        INSERT OR IGNORE INTO movies (
          id, slug, title, subtitle, description, description_html, poster_url, duration_label, duration_seconds,
          year, rating, genre, type, language, featured, status, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `,
      [
        movie.id,
        movie.id,
        movie.title,
        movie.subtitle ?? null,
        movie.description,
        `<p>${movie.description}</p>`,
        movie.image,
        movie.duration,
        null,
        movie.year,
        movie.rating,
        movie.genre,
        movie.type,
        movie.language,
        movie.featured ? 1 : 0,
        DEFAULT_ADMIN_ID,
      ],
    )
  }
}

async function ensureTracksSeeded() {
  const count = await firstRow<{ count: number }>('SELECT COUNT(*) as count FROM tracks')
  if (asNumber(count?.count) > 0) return

  for (const track of musicTracks) {
    await runQuery(
      `
        INSERT OR IGNORE INTO tracks (
          id, slug, title, artist_name, album_name, cover_url, genre, duration_label, duration_seconds,
          audio_url, preview_url, popularity, release_date, lyrics, status, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `,
      [
        track.id,
        track.id,
        track.title,
        track.artist,
        track.album ?? null,
        track.image,
        track.genre,
        track.duration,
        track.durationSeconds,
        track.url ?? null,
        track.url ?? null,
        track.popularity ?? 0,
        track.releaseDate ?? null,
        track.lyrics ?? null,
        DEFAULT_ADMIN_ID,
      ],
    )
  }
}

async function ensureShortsSeeded() {
  const count = await firstRow<{ count: number }>('SELECT COUNT(*) as count FROM shorts')
  if (asNumber(count?.count) > 0) return

  for (const short of shortVideos) {
    await runQuery(
      `
        INSERT OR IGNORE INTO shorts (
          id, title, category, duration_seconds, image_url, video_url, caption, status, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `,
      [short.id, short.title, short.category, short.durationSeconds, short.image, short.videoUrl ?? null, short.caption, DEFAULT_ADMIN_ID],
    )
  }
}

function inferSport(match: SportsMatch) {
  if (match.league.toLowerCase().includes('nba') || match.league.toLowerCase().includes('fiba')) return 'basketball'
  if (match.league.toLowerCase().includes('volleyball')) return 'volleyball'
  return 'football'
}

function inferMatchDate(tab: SportsTab) {
  const today = new Date()
  const target = new Date(today)
  if (tab === 'yesterday') target.setDate(today.getDate() - 1)
  if (tab === 'upcoming') target.setDate(today.getDate() + 1)
  return target.toISOString().slice(0, 10)
}

async function ensureSportsSeeded() {
  const count = await firstRow<{ count: number }>('SELECT COUNT(*) as count FROM sports_matches')
  if (asNumber(count?.count) > 0) return

  const matches = getAllMatches()
  for (const match of matches) {
    await runQuery(
      `
        INSERT OR IGNORE INTO sports_matches (
          id, sport, league_name, league_color, team_a_name, team_a_logo_url, team_a_record,
          team_b_name, team_b_logo_url, team_b_record, match_time_label, match_date, status,
          score_a, score_b, stream_url, hero_image_url, starred, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        match.id,
        inferSport(match),
        match.league,
        match.leagueColor,
        match.team1.name,
        match.team1.logo,
        match.team1.record,
        match.team2.name,
        match.team2.logo,
        match.team2.record,
        match.time,
        inferMatchDate(match.tab),
        match.status ?? 'upcoming',
        match.score1 ?? null,
        match.score2 ?? null,
        null,
        match.heroImage ?? null,
        match.starred ? 1 : 0,
        DEFAULT_ADMIN_ID,
      ],
    )
  }
}

async function ensureNewsSeeded() {
  const count = await firstRow<{ count: number }>('SELECT COUNT(*) as count FROM news_items')
  if (asNumber(count?.count) > 0) return

  for (const item of seedNewsItems) {
    await runQuery(
      `
        INSERT OR IGNORE INTO news_items (
          id, title, category, summary, content, source, time_label, image_url, source_url, video_url,
          status, published_at, created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP, ?)
      `,
      [
        item.id,
        item.title,
        item.category,
        item.summary,
        item.content ?? null,
        item.source,
        item.time,
        item.image,
        item.url ?? null,
        item.videoUrl ?? null,
        DEFAULT_ADMIN_ID,
      ],
    )
  }
}

export async function ensureCoreContentSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureUsersSeeded()
      await ensureMoviesSeeded()
      await ensureTracksSeeded()
      await ensureShortsSeeded()
      await ensureSportsSeeded()
      await ensureNewsSeeded()
    })()
  }

  await seedPromise
}

function mapMovie(row: MovieRow): MovieItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    image: row.poster_url || '/placeholder.jpg',
    featured: asBoolean(row.featured),
    description: row.description,
    duration: row.duration_label || '0m',
    year: asNumber(row.year, new Date().getFullYear()),
    rating: asNumber(row.rating),
    genre: row.genre || 'Unknown',
    type: row.type,
    language: row.language,
  }
}

function mapTrack(row: TrackRow): MusicTrack {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist_name,
    album: row.album_name ?? undefined,
    image: row.cover_url || '/music-featured.jpg',
    genre: row.genre || 'Unknown',
    duration: row.duration_label || '0:00',
    durationSeconds: asNumber(row.duration_seconds),
    url: row.audio_url ?? undefined,
    popularity: asNumber(row.popularity),
    releaseDate: row.release_date ?? undefined,
    lyrics: row.lyrics ?? undefined,
  }
}

function mapShort(row: ShortRow): ShortVideo {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    durationSeconds: asNumber(row.duration_seconds),
    image: row.image_url,
    videoUrl: row.video_url ?? undefined,
    caption: row.caption ?? '',
  }
}

function mapSportsMatch(row: SportsRow): SportsMatch & { id: string; tab: SportsTab } {
  const status = (row.status === 'finished' ? 'final' : row.status) as SportsMatch['status']
  const tab = inferSportsTab(row.match_date, row.status)
  return {
    id: row.id,
    tab,
    league: row.league_name,
    leagueColor: row.league_color || '#003399',
    team1: {
      name: row.team_a_name,
      initial: row.team_a_name.slice(0, 3).toUpperCase(),
      color: '#ffffff',
      logo: row.team_a_logo_url || '/placeholder-logo.svg',
      record: row.team_a_record || '',
    },
    team2: {
      name: row.team_b_name,
      initial: row.team_b_name.slice(0, 3).toUpperCase(),
      color: '#ffffff',
      logo: row.team_b_logo_url || '/placeholder-logo.svg',
      record: row.team_b_record || '',
    },
    time: row.match_time_label || row.match_date || 'TBD',
    status,
    score1: row.score_a ?? undefined,
    score2: row.score_b ?? undefined,
    starred: asBoolean(row.starred),
    heroImage: row.hero_image_url ?? undefined,
  }
}

function mapNews(row: NewsRow): NewsItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    content: row.content ?? undefined,
    source: row.source,
    time: row.time_label || 'Just now',
    image: row.image_url,
    url: row.source_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
  }
}

function mapCommunityItem(row: CommunityItemRow): CommunityItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description ?? '',
    imageUrl: row.image_url,
    trailerUrl: row.trailer_url ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by_user_id,
    createdByName: row.created_by_name ?? undefined,
    createdByEmail: row.created_by_email ?? undefined,
    status: row.status,
  }
}

export async function listMoviesFromDb() {
  await ensureCoreContentSeeded()
  const rows = await allRows<MovieRow>('SELECT * FROM movies ORDER BY featured DESC, created_at DESC')
  return rows.map(mapMovie)
}

export async function getMovieFromDb(id: string) {
  await ensureCoreContentSeeded()
  const row = await firstRow<MovieRow>('SELECT * FROM movies WHERE id = ? LIMIT 1', [id])
  return row ? mapMovie(row) : null
}

export async function listMoviesForAdminFromDb() {
  await ensureCoreContentSeeded()
  return allRows<MovieRow>(
    `
      SELECT m.*, u.name as created_by_name, u.email as created_by_email
      FROM movies m
      LEFT JOIN users u ON u.id = m.created_by_user_id
      ORDER BY m.created_at DESC
    `,
  )
}

export async function upsertMovieInDb(input: {
  id?: string
  title: string
  category: string
  language: MovieItem['language']
  quality: string
  date: string
  status: 'Active' | 'Draft'
  poster: string
  descriptionHtml: string
  createdByUserId?: string
  videoLabel?: string
  thumbnailLabel?: string
}) {
  const id = input.id?.trim() || uid('movie')
  await runQuery(
    `
      INSERT INTO movies (
        id, slug, title, description, description_html, poster_url, thumbnail_url, video_url, duration_label,
        year, rating, genre, type, language, featured, status, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'movie', ?, 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        title = excluded.title,
        description = excluded.description,
        description_html = excluded.description_html,
        poster_url = excluded.poster_url,
        thumbnail_url = excluded.thumbnail_url,
        video_url = excluded.video_url,
        duration_label = excluded.duration_label,
        year = excluded.year,
        genre = excluded.genre,
        language = excluded.language,
        status = excluded.status,
        created_by_user_id = excluded.created_by_user_id,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      id,
      id,
      input.title.trim(),
      stripHtml(input.descriptionHtml) || input.title.trim(),
      input.descriptionHtml,
      input.poster.trim() || null,
      input.thumbnailLabel?.trim() || null,
      input.videoLabel?.trim() || null,
      input.quality.trim() || 'HD',
      Number(input.date.slice(0, 4)) || new Date().getFullYear(),
      input.category.trim(),
      input.language,
      input.status === 'Active' ? 'active' : 'draft',
      input.createdByUserId || DEFAULT_ADMIN_ID,
    ],
  )
  return id
}

export async function deleteMovieFromDb(id: string) {
  await runQuery('DELETE FROM movies WHERE id = ?', [id])
}

export async function listTracksFromDb() {
  await ensureCoreContentSeeded()
  const rows = await allRows<TrackRow>('SELECT * FROM tracks ORDER BY release_date DESC, created_at DESC')
  return rows.map(mapTrack)
}

export async function getTrackFromDb(id: string) {
  await ensureCoreContentSeeded()
  const row = await firstRow<TrackRow>('SELECT * FROM tracks WHERE id = ? LIMIT 1', [id])
  return row ? mapTrack(row) : null
}

export async function listTracksForAdminFromDb() {
  await ensureCoreContentSeeded()
  return allRows<TrackRow>('SELECT * FROM tracks ORDER BY created_at DESC')
}

export async function upsertTrackInDb(input: {
  id?: string
  title: string
  artist: string
  genre: string
  duration: string
  cover?: string
  status: 'Active' | 'Draft'
  album?: string
  createdByUserId?: string
}) {
  const id = input.id?.trim() || uid('track')
  await runQuery(
    `
      INSERT INTO tracks (
        id, slug, title, artist_name, album_name, cover_url, genre, duration_label, duration_seconds,
        audio_url, preview_url, popularity, release_date, lyrics, status, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 0, CURRENT_TIMESTAMP, NULL, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        title = excluded.title,
        artist_name = excluded.artist_name,
        album_name = excluded.album_name,
        cover_url = excluded.cover_url,
        genre = excluded.genre,
        duration_label = excluded.duration_label,
        duration_seconds = excluded.duration_seconds,
        status = excluded.status,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      id,
      id,
      input.title.trim(),
      input.artist.trim(),
      input.album?.trim() || null,
      input.cover?.trim() || null,
      input.genre.trim(),
      input.duration.trim(),
      durationLabelToSeconds(input.duration),
      input.status === 'Active' ? 'active' : 'draft',
      input.createdByUserId || DEFAULT_ADMIN_ID,
    ],
  )
  return id
}

export async function deleteTrackFromDb(id: string) {
  await runQuery('DELETE FROM tracks WHERE id = ?', [id])
}

export async function listShortsFromDb() {
  await ensureCoreContentSeeded()
  const rows = await allRows<ShortRow>('SELECT * FROM shorts ORDER BY created_at DESC')
  return rows.map(mapShort)
}

export async function getShortFromDb(id: string) {
  await ensureCoreContentSeeded()
  const row = await firstRow<ShortRow>('SELECT * FROM shorts WHERE id = ? LIMIT 1', [id])
  return row ? mapShort(row) : null
}

export async function upsertShortInDb(input: {
  id?: string
  title: string
  category: ShortVideo['category']
  durationSeconds: number
  image: string
  caption: string
  createdByUserId?: string
}) {
  const id = input.id?.trim() || uid('short')
  await runQuery(
    `
      INSERT INTO shorts (
        id, title, category, duration_seconds, image_url, video_url, caption, status, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NULL, ?, 'active', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        category = excluded.category,
        duration_seconds = excluded.duration_seconds,
        image_url = excluded.image_url,
        caption = excluded.caption,
        updated_at = CURRENT_TIMESTAMP
    `,
    [id, input.title.trim(), input.category, input.durationSeconds, input.image.trim(), input.caption.trim(), input.createdByUserId || DEFAULT_ADMIN_ID],
  )
  return id
}

export async function deleteShortFromDb(id: string) {
  await runQuery('DELETE FROM shorts WHERE id = ?', [id])
}

export async function listSportsMatchesFromDb() {
  await ensureCoreContentSeeded()
  const rows = await allRows<SportsRow>('SELECT * FROM sports_matches ORDER BY match_date ASC, created_at DESC')
  return rows.map(mapSportsMatch)
}

export async function getSportsMatchFromDb(id: string) {
  await ensureCoreContentSeeded()
  const row = await firstRow<SportsRow>('SELECT * FROM sports_matches WHERE id = ? LIMIT 1', [id])
  return row ? mapSportsMatch(row) : null
}

export async function listSportsForAdminFromDb() {
  await ensureCoreContentSeeded()
  return allRows<SportsRow>('SELECT * FROM sports_matches ORDER BY match_date ASC, created_at DESC')
}

export async function upsertSportsMatchInDb(input: {
  id?: string
  sport: 'Football' | 'Basketball' | 'Volleyball'
  teamA: string
  teamALogo?: string
  teamB: string
  teamBLogo?: string
  league: string
  leagueLogo?: string
  date: string
  status: 'Live' | 'Upcoming' | 'Finished'
  stream: string
  createdByUserId?: string
}) {
  const id = input.id?.trim() || uid('match')
  await runQuery(
    `
      INSERT INTO sports_matches (
        id, sport, league_name, league_logo_url, team_a_name, team_a_logo_url, team_a_record, team_b_name, team_b_logo_url,
        team_b_record, match_time_label, match_date, status, score_a, score_b, stream_url, hero_image_url, starred, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, '', ?, ?, ?, NULL, NULL, ?, ?, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        sport = excluded.sport,
        league_name = excluded.league_name,
        league_logo_url = excluded.league_logo_url,
        team_a_name = excluded.team_a_name,
        team_a_logo_url = excluded.team_a_logo_url,
        team_b_name = excluded.team_b_name,
        team_b_logo_url = excluded.team_b_logo_url,
        match_time_label = excluded.match_time_label,
        match_date = excluded.match_date,
        status = excluded.status,
        stream_url = excluded.stream_url,
        hero_image_url = excluded.hero_image_url,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      id,
      input.sport.toLowerCase(),
      input.league.trim(),
      input.leagueLogo?.trim() || null,
      input.teamA.trim(),
      input.teamALogo?.trim() || null,
      input.teamB.trim(),
      input.teamBLogo?.trim() || null,
      input.date.trim(),
      input.date.trim(),
      normalizeSportsStatus(input.status),
      input.stream.trim(),
      input.leagueLogo?.trim() || null,
      input.createdByUserId || DEFAULT_ADMIN_ID,
    ],
  )
  return id
}

export async function deleteSportsMatchFromDb(id: string) {
  await runQuery('DELETE FROM sports_matches WHERE id = ?', [id])
}

export async function listNewsFromDb() {
  await ensureCoreContentSeeded()
  const rows = await allRows<NewsRow>('SELECT * FROM news_items ORDER BY published_at DESC, created_at DESC')
  return rows.map(mapNews)
}

export async function upsertNewsInDb(input: {
  id?: string
  title: string
  category: NewsItem['category']
  summary: string
  content?: string
  source: string
  time: string
  image: string
  url?: string
  videoUrl?: string
  createdByUserId?: string
}) {
  const id = input.id?.trim() || uid('news')
  await runQuery(
    `
      INSERT INTO news_items (
        id, title, category, summary, content, source, time_label, image_url, source_url, video_url,
        status, published_at, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        category = excluded.category,
        summary = excluded.summary,
        content = excluded.content,
        source = excluded.source,
        time_label = excluded.time_label,
        image_url = excluded.image_url,
        source_url = excluded.source_url,
        video_url = excluded.video_url,
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      id,
      input.title.trim(),
      input.category,
      input.summary.trim(),
      input.content?.trim() || null,
      input.source.trim(),
      input.time.trim(),
      input.image.trim(),
      input.url?.trim() || null,
      input.videoUrl?.trim() || null,
      input.createdByUserId || DEFAULT_ADMIN_ID,
    ],
  )
  return id
}

export async function deleteNewsFromDb(id: string) {
  await runQuery('DELETE FROM news_items WHERE id = ?', [id])
}

export async function listCommunityItemsFromDb() {
  await ensureUsersSeeded()
  const rows = await allRows<CommunityItemRow>(
    `
      SELECT cu.*, u.name as created_by_name, u.email as created_by_email
      FROM community_uploads cu
      LEFT JOIN users u ON u.id = cu.created_by_user_id
      ORDER BY cu.created_at DESC
    `,
  )
  return rows.map(mapCommunityItem)
}

export async function listCommunityLikesFromDb() {
  return allRows<CommunityLike>('SELECT id, upload_id as itemId, user_id as userId, created_at as createdAt FROM community_likes ORDER BY created_at DESC')
}

export async function listCommunityRatingsFromDb() {
  return allRows<CommunityRating>(
    'SELECT id, upload_id as itemId, user_id as userId, stars, created_at as createdAt FROM community_ratings ORDER BY created_at DESC',
  )
}

export async function createCommunityItemInDb(input: {
  kind: CommunityItem['kind']
  title: string
  description: string
  imageUrl: string
  trailerUrl?: string
  createdBy: string
}) {
  await ensureUsersSeeded()
  const id = uid('ugc')
  await runQuery(
    `
      INSERT INTO community_uploads (
        id, kind, title, description, image_url, trailer_url, status, created_by_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [id, input.kind, input.title.trim(), input.description.trim(), input.imageUrl.trim(), input.trailerUrl?.trim() || null, input.createdBy],
  )
  return id
}

export async function setCommunityItemStatusInDb(itemId: string, status: CommunityStatus) {
  await runQuery(
    `
      UPDATE community_uploads
      SET status = ?, published_at = CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE published_at END, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, status, itemId],
  )
}

export async function deleteCommunityItemFromDb(itemId: string) {
  await runQuery('DELETE FROM community_uploads WHERE id = ?', [itemId])
}

export async function rateCommunityItemInDb(itemId: string, userId: string, stars: number) {
  await ensureUsersSeeded()
  const safeStars = Math.max(1, Math.min(5, Math.round(stars)))
  const existing = await firstRow<{ id: string }>(
    'SELECT id FROM community_ratings WHERE upload_id = ? AND user_id = ? LIMIT 1',
    [itemId, userId],
  )

  if (existing?.id) {
    await runQuery('UPDATE community_ratings SET stars = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [safeStars, existing.id])
  } else {
    await runQuery(
      'INSERT INTO community_ratings (id, upload_id, user_id, stars, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [uid('rate'), itemId, userId, safeStars],
    )
  }
}

export async function toggleCommunityLikeInDb(itemId: string, userId: string) {
  await ensureUsersSeeded()
  const existing = await firstRow<{ id: string }>(
    'SELECT id FROM community_likes WHERE upload_id = ? AND user_id = ? LIMIT 1',
    [itemId, userId],
  )

  if (existing?.id) {
    await runQuery('DELETE FROM community_likes WHERE id = ?', [existing.id])
    return false
  }

  await runQuery('INSERT INTO community_likes (id, upload_id, user_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [
    uid('like'),
    itemId,
    userId,
  ])
  return true
}

export async function listBotFaqEntriesFromDb() {
  const rows = await allRows<{ id: string; title: string; keywords_json: string; response_text: string; is_active: number }>(
    'SELECT * FROM bot_faq_entries WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC',
  )
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    keywords: parseJsonArray(row.keywords_json),
    responseText: row.response_text,
  }))
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function durationLabelToSeconds(value: string) {
  const match = value.trim().match(/^(\d+):(\d{2})$/)
  if (!match) return 0
  return Number(match[1]) * 60 + Number(match[2])
}

function normalizeSportsStatus(status: 'Live' | 'Upcoming' | 'Finished') {
  if (status === 'Finished') return 'finished'
  return status.toLowerCase()
}

function inferSportsTab(matchDate: string | null, status: string): SportsTab {
  if (!matchDate) {
    return status === 'finished' ? 'yesterday' : 'today'
  }

  const today = new Date().toISOString().slice(0, 10)
  if (matchDate < today) return 'yesterday'
  if (matchDate > today) return 'upcoming'
  return 'today'
}
