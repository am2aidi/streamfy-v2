PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'email',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'deleted')),
  password_hash TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  phone_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reset_token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  accent_theme TEXT NOT NULL DEFAULT 'gold',
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'fr', 'rw')),
  audio_quality TEXT NOT NULL DEFAULT 'High',
  subscription_plan TEXT NOT NULL DEFAULT 'day',
  payment_method TEXT NOT NULL DEFAULT 'rw-mtn-airtel',
  two_factor INTEGER NOT NULL DEFAULT 0,
  login_notifs INTEGER NOT NULL DEFAULT 1,
  push_notifs INTEGER NOT NULL DEFAULT 1,
  email_notifs INTEGER NOT NULL DEFAULT 0,
  sound_effects INTEGER NOT NULL DEFAULT 1,
  public_profile INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorite_leagues (
  user_id TEXT NOT NULL,
  league_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, league_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('movie', 'track', 'match', 'short')),
  item_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playlist_items (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  UNIQUE (playlist_id, track_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('movie', 'track', 'match', 'short')),
  item_id TEXT NOT NULL,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  quality TEXT,
  subtitle_language TEXT,
  watched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS download_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('movie', 'track', 'match', 'short')),
  item_id TEXT NOT NULL,
  quality TEXT,
  subtitle_language TEXT,
  season_number INTEGER,
  episode_number INTEGER,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'ready', 'failed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  description_html TEXT,
  poster_url TEXT,
  thumbnail_url TEXT,
  trailer_url TEXT,
  video_url TEXT,
  duration_label TEXT,
  duration_seconds INTEGER,
  year INTEGER,
  rating REAL NOT NULL DEFAULT 0,
  genre TEXT,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series', 'animation')),
  language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'rw')),
  featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS series_episodes (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  video_url TEXT,
  thumbnail_url TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (series_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE (series_id, season_number, episode_number)
);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  cover_url TEXT,
  genre TEXT,
  duration_label TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  audio_url TEXT,
  preview_url TEXT,
  popularity INTEGER NOT NULL DEFAULT 0,
  release_date TEXT,
  lyrics TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS favorite_tracks (
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, track_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shorts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('movies', 'music', 'sports', 'comedy')),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  video_url TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sports_matches (
  id TEXT PRIMARY KEY,
  sport TEXT NOT NULL CHECK (sport IN ('football', 'basketball', 'volleyball')),
  league_name TEXT NOT NULL,
  league_color TEXT,
  league_logo_url TEXT,
  team_a_name TEXT NOT NULL,
  team_a_logo_url TEXT,
  team_a_record TEXT,
  team_b_name TEXT NOT NULL,
  team_b_logo_url TEXT,
  team_b_record TEXT,
  match_time_label TEXT,
  match_date TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('live', 'upcoming', 'finished', 'final')),
  score_a INTEGER,
  score_b INTEGER,
  stream_url TEXT,
  hero_image_url TEXT,
  starred INTEGER NOT NULL DEFAULT 0,
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('music', 'sports', 'movies', 'comedy')),
  summary TEXT NOT NULL,
  content TEXT,
  source TEXT NOT NULL,
  time_label TEXT,
  image_url TEXT NOT NULL,
  source_url TEXT,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS community_uploads (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('movie', 'song', 'match', 'short')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  trailer_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'deleted')),
  created_by_user_id TEXT NOT NULL,
  published_at TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_likes (
  id TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upload_id) REFERENCES community_uploads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (upload_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_ratings (
  id TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upload_id) REFERENCES community_uploads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (upload_id, user_id)
);

CREATE TABLE IF NOT EXISTS copyright_reports (
  id TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  reporter_user_id TEXT,
  reporter_email TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  FOREIGN KEY (upload_id) REFERENCES community_uploads(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_anonymous INTEGER NOT NULL DEFAULT 1,
  retention_days INTEGER NOT NULL DEFAULT 30,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT,
  thread_id TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT,
  text TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_faq_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  keywords_json TEXT NOT NULL,
  response_text TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('single_movie', 'time_pass')),
  duration_days INTEGER,
  price_rwf INTEGER NOT NULL,
  icon TEXT,
  is_popular INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  starts_at TEXT,
  ends_at TEXT,
  auto_renew INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  provider TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  amount_rwf INTEGER NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'succeeded', 'failed', 'cancelled')),
  provider_ref TEXT,
  failure_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL,
  status TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ads_campaigns (
  id TEXT PRIMARY KEY,
  banner_name TEXT NOT NULL,
  advertiser TEXT NOT NULL,
  placement TEXT NOT NULL CHECK (placement IN ('home', 'movie', 'sport', 'music')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  performance_text TEXT,
  creative_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_links (
  name TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  fee_percent REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS filter_options (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('movies', 'music', 'sports')),
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (section, value)
);

CREATE TABLE IF NOT EXISTS playlist_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS translation_overrides (
  language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'rw')),
  translation_key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (language, translation_key)
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  event_name TEXT NOT NULL,
  item_type TEXT,
  item_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist_items(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_download_requests_user_id ON download_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_status_featured ON movies(status, featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_status_release_date ON tracks(status, release_date DESC);
CREATE INDEX IF NOT EXISTS idx_favorite_tracks_user_id ON favorite_tracks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shorts_status_category ON shorts(status, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sports_matches_status_date ON sports_matches(status, match_date);
CREATE INDEX IF NOT EXISTS idx_news_status_category ON news_items(status, category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_uploads_status_created_at ON community_uploads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_upload_id ON community_likes(upload_id);
CREATE INDEX IF NOT EXISTS idx_community_ratings_upload_id ON community_ratings(upload_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at ON payments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ads_campaigns_status_dates ON ads_campaigns(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created_at ON analytics_events(event_name, created_at DESC);

INSERT OR IGNORE INTO chat_rooms (id, slug, name, description, is_anonymous, retention_days)
VALUES
  ('room-feedback', 'feedback', 'Feedback Room', 'Share ideas, report issues, and request features.', 1, 30);

INSERT OR IGNORE INTO subscription_plans (id, label, access_type, duration_days, price_rwf, icon, is_popular, is_active, sort_order)
VALUES
  ('movie', 'Movie Pass', 'single_movie', NULL, 100, 'Star', 0, 1, 1),
  ('day', '1 Day Plan', 'time_pass', 1, 200, 'Zap', 1, 1, 2),
  ('week', '1 Week Plan', 'time_pass', 7, 400, 'CreditCard', 0, 1, 3),
  ('twoWeeks', '2 Weeks Plan', 'time_pass', 14, 700, 'CreditCard', 0, 1, 4),
  ('month', '1 Month Plan', 'time_pass', 30, 1000, 'CreditCard', 0, 1, 5);

INSERT OR IGNORE INTO social_links (name, url, enabled)
VALUES
  ('TikTok', 'https://tiktok.com/@streamfy', 1),
  ('WhatsApp', 'https://wa.me/250700000000', 1),
  ('YouTube', 'https://youtube.com/@streamfy', 1);

INSERT OR IGNORE INTO payment_methods (id, label, enabled, fee_percent)
VALUES
  ('rw-mtn-airtel', 'MTN | Airtel Rwanda', 1, 0),
  ('visa-mastercard', 'VISA & MasterCard', 1, 2.5),
  ('ke-mpesa', 'MPESA Kenya', 1, 1.2);

INSERT OR IGNORE INTO filter_options (id, section, value, sort_order)
VALUES
  ('filter-movies-1', 'movies', 'Action', 1),
  ('filter-movies-2', 'movies', 'Comedy', 2),
  ('filter-movies-3', 'movies', 'Sci-Fi', 3),
  ('filter-movies-4', 'movies', 'Drama', 4),
  ('filter-movies-5', 'movies', 'Mystery', 5),
  ('filter-movies-6', 'movies', 'Romance', 6),
  ('filter-music-1', 'music', 'Pop', 1),
  ('filter-music-2', 'music', 'Rap', 2),
  ('filter-music-3', 'music', 'EDM', 3),
  ('filter-music-4', 'music', 'Soul', 4),
  ('filter-music-5', 'music', 'Afrobeat', 5),
  ('filter-music-6', 'music', 'Jazz', 6),
  ('filter-sports-1', 'sports', 'Football', 1),
  ('filter-sports-2', 'sports', 'Basketball', 2),
  ('filter-sports-3', 'sports', 'Volleyball', 3),
  ('filter-sports-4', 'sports', 'Tennis', 4),
  ('filter-sports-5', 'sports', 'Formula 1', 5);

INSERT OR IGNORE INTO playlist_presets (id, name, sort_order, is_active)
VALUES
  ('preset-workout-mix', 'Workout Mix', 1, 1),
  ('preset-night-drive', 'Night Drive', 2, 1);

INSERT OR IGNORE INTO bot_faq_entries (id, title, keywords_json, response_text, is_active, sort_order)
VALUES
  ('greeting', 'Greeting', '["hi","hello","hey"]', 'Hi! I''m Streamfy Bot. I can help with downloads, watchlist, sharing, plans, and reporting issues.', 1, 1),
  ('download', 'Download', '["download","downloader","save video"]', 'To download:\n1) Open a movie.\n2) Tap Download.\n3) Pick quality + subtitles.\n\nNote: only download content you have the rights to share.', 1, 2),
  ('watchlist', 'Watchlist', '["watchlist","watch later","saved"]', 'Watchlist:\n- Tap the heart / Watch Later button on movies or shorts.\n- Open Watchlist from the sidebar to see everything you saved.', 1, 3),
  ('report', 'Report', '["report","problem","bug","issue","not working","error"]', 'Please include:\n- What page you were on\n- What you clicked\n- What you expected\n- What happened instead\n- Your device/browser\n\nYou can also post it in the Feedback Room so admins can review it.', 1, 4),
  ('plans', 'Plans', '["plan","price","subscription","pay"]', 'Plans are in Settings -> Subscription.\nTip: pick Day/Week/Month depending on how often you watch.', 1, 5),
  ('share', 'Share', '["share","link","send to friend"]', 'You can share Streamfy links by copying the page URL and sending it in chat.\nOnly Streamfy internal links are allowed in chat (no external links).', 1, 6),
  ('rules', 'Rules', '["rule","rules","ban","abuse"]', 'Chat rules:\n- Be respectful.\n- Don''t spam.\n- Only share Streamfy internal links.\nMessages auto-delete after 30 days.', 1, 7);
