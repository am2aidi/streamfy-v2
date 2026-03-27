'use client'

import { useMemo, useState } from 'react'
import { X, Download as DownloadIcon, ChevronDown } from 'lucide-react'
import { SmartCover } from '@/components/SmartCover'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation } from '@/lib/translations'

export type DownloadMediaType = 'movie' | 'series' | 'anime'

export interface DownloadSelection {
  quality: '360p' | '480p' | '720p' | '1080p'
  subtitle: string
  season?: number
  episode?: number
}

export function DownloadOptionsModal({
  open,
  onClose,
  title,
  imageUrl,
  description,
  tags = [],
  mediaType = 'movie',
  seasonCount = 1,
  episodesPerSeason = 24,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  title: string
  imageUrl: string
  description?: string
  tags?: string[]
  mediaType?: DownloadMediaType
  seasonCount?: number
  episodesPerSeason?: number
  onConfirm: (selection: DownloadSelection) => void
}) {
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)
  const showEpisodes = mediaType === 'series' || mediaType === 'anime'
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [quality, setQuality] = useState<DownloadSelection['quality']>('720p')
  const [subtitle, setSubtitle] = useState('English')

  const episodeCount = useMemo(() => Math.max(1, episodesPerSeason), [episodesPerSeason])
  const seasons = useMemo(() => Array.from({ length: Math.max(1, seasonCount) }, (_, i) => i + 1), [seasonCount])
  const episodes = useMemo(() => Array.from({ length: episodeCount }, (_, i) => i + 1), [episodeCount])

  const subtitleOptions = useMemo(
    () => [
      { label: 'None', size: '—' },
      { label: 'Arabic', size: '23.9 KB' },
      { label: 'Bangla', size: '32.4 KB' },
      { label: 'English', size: '20.1 KB' },
      { label: 'Kinyarwanda', size: '18.4 KB' },
      { label: 'Filipino', size: '20.7 KB' },
      { label: 'Français', size: '21.0 KB' },
      { label: 'Indonesian', size: '21.7 KB' },
      { label: 'Malay', size: '20.8 KB' },
      { label: 'Português', size: '21.2 KB' },
      { label: 'Русский', size: '26.5 KB' },
      { label: 'اردو', size: '26.4 KB' },
      { label: '中文', size: '20.9 KB' },
    ],
    [],
  )

  const commonSubtitles = useMemo(() => ['English', 'Français', 'Kinyarwanda', 'Arabic', 'Português', 'None'], [])
  const otherSubtitleOptions = useMemo(
    () => subtitleOptions.filter((s) => !commonSubtitles.includes(s.label)),
    [commonSubtitles, subtitleOptions],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#070c18] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-white text-xl font-bold">{t('downloadOptions')}</h2>
            <p className="mt-1 text-xs text-gray-400">Choose episode, quality, and subtitles.</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-200 hover:bg-white/10" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto p-5">
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex-1 rounded-3xl border border-white/10 bg-black/25 p-4">
              <div className="flex gap-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                  <SmartCover src={imageUrl} alt={title} className="object-cover" sizes="112px" priority />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-lg font-bold">{title}</p>
                  {description ? <p className="mt-2 text-sm text-gray-300 line-clamp-3">{description}</p> : null}
                  {tags.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.slice(0, 5).map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {showEpisodes ? (
              <div className="flex-1 rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">{t('selectEpisode')}</p>
                  <div className="relative">
                    <select
                      value={season}
                      onChange={(e) => setSeason(Number(e.target.value))}
                      className="appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2 pr-9 text-sm text-white"
                    >
                      {seasons.map((s) => (
                        <option key={s} value={s}>
                          Season {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-8 gap-2">
                  {episodes.map((n) => {
                    const active = n === episode
                    return (
                      <button
                        key={n}
                        onClick={() => setEpisode(n)}
                        className={`h-10 rounded-xl border text-sm font-semibold transition-colors ${
                          active
                            ? 'border-[color:var(--app-accent-a)] bg-[color:var(--app-accent-a)]/15 text-[color:var(--app-accent-a)]'
                            : 'border-white/10 bg-white/[0.03] text-gray-200 hover:bg-white/[0.06]'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <p className="text-white font-semibold">{t('selectQuality')}</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {([
                  { q: '360p', size: '55.3 MB' },
                  { q: '480p', size: '82.0 MB' },
                  { q: '720p', size: '128.6 MB' },
                ] as const).map(({ q, size }) => {
                  const active = quality === q
                  return (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        active ? 'border-[color:var(--app-accent-a)] bg-white/[0.06]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <p className="text-white text-lg font-bold">{q.toUpperCase()}</p>
                      <p className="mt-1 text-xs text-gray-400">MP4</p>
                      <p className="mt-2 text-xs text-gray-400">{size}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <p className="text-white font-semibold">{t('selectSubtitles')}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {subtitleOptions
                  .filter((opt) => commonSubtitles.includes(opt.label))
                  .map((opt) => {
                  const active = subtitle === opt.label
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSubtitle(opt.label)}
                      className={`rounded-2xl border p-3 text-left transition-colors ${
                        active ? 'border-[color:var(--app-accent-a)] bg-white/[0.06]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <p className="text-white text-sm font-semibold">{opt.label}</p>
                      <p className="mt-2 text-xs text-gray-400">{opt.size}</p>
                    </button>
                  )
                })}
              </div>

              {otherSubtitleOptions.length ? (
                <div className="mt-4">
                  <label className="text-xs text-gray-400">Other subtitles</label>
                  <div className="mt-1 relative">
                    <select
                      value={otherSubtitleOptions.some((o) => o.label === subtitle) ? subtitle : ''}
                      onChange={(e) => setSubtitle(e.target.value || 'English')}
                      className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white"
                    >
                      <option value="">Select…</option>
                      {otherSubtitleOptions.map((o) => (
                        <option key={o.label} value={o.label}>
                          {o.label} ({o.size})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-gray-200 hover:bg-white/[0.06]"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() =>
                onConfirm({
                  quality,
                  subtitle,
                  season: showEpisodes ? season : undefined,
                  episode: showEpisodes ? episode : undefined,
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-[color:var(--app-accent-fg)] shadow-[0_18px_45px_color-mix(in_oklab,var(--app-accent-a)_28%,transparent)]"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--app-accent-a), var(--app-accent-b))' }}
            >
              <DownloadIcon size={16} />
              {t('startDownload')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
