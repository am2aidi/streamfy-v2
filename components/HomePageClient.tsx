'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight, ListPlus, Pause, Play, Search, SkipBack, SkipForward, Star, X } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation, type TranslationKey, languages } from '@/lib/translations'
import { movieCards } from '@/lib/movies-data'
import { musicTracks } from '@/lib/music-data'
import { getAllMatches } from '@/lib/sports-data'
import { BRAND_NAME } from '@/lib/brand'
import { useToast } from '@/hooks/use-toast'

const filterYears = ['all', '2026', '2025', '2024', 'other'] as const
const filterCategories = ['All', 'Action', 'Comedy', 'Sci-Fi']
const animatedWords = ['MOVIES', 'MUSIC', 'SPORTS']
const safeTrackImages = new Set(['/trending-songs.jpg', '/new-releases.jpg', '/pop-hits.jpg', '/music-featured.jpg'])

export function HomePageClient() {
  const { settings, updateSetting } = useAppSettings()
  const { toast } = useToast()
  const t = (key: TranslationKey) => getTranslation(settings.language, key)
  const [search, setSearch] = useState('')
  const [selectedYear, setSelectedYear] = useState<(typeof filterYears)[number]>('all')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [watchLater, setWatchLater] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playlistInput, setPlaylistInput] = useState('')
  const [playlists, setPlaylists] = useState<string[]>(['Workout Mix', 'Night Drive'])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length)
    }, 2200)
    return () => window.clearInterval(timer)
  }, [])

  const leagues = useMemo(() => {
    const unique = new Set(getAllMatches().map((match) => match.league))
    return ['all', ...Array.from(unique)]
  }, [])

  const normalizedQuery = search.trim().toLowerCase()
  const normalizedTracks = useMemo(() => {
    return musicTracks
      .slice(0, 24)
      .map((track) => ({
        ...track,
        image: safeTrackImages.has(track.image) ? track.image : '/music-featured.jpg',
        releaseYear: track.releaseDate ? new Date(track.releaseDate).getFullYear() : 2026,
      }))
  }, [])

  const filteredMovies = useMemo(() => {
    return movieCards.filter((movie) => {
      const byYear =
        selectedYear === 'all' ||
        String(movie.year) === selectedYear ||
        (selectedYear === 'other' && !['2026', '2025', '2024'].includes(String(movie.year)))
      const byCategory = selectedCategory === 'All' || movie.genre.toLowerCase().includes(selectedCategory.toLowerCase())
      const bySearch =
        !normalizedQuery ||
        movie.title.toLowerCase().includes(normalizedQuery) ||
        movie.description.toLowerCase().includes(normalizedQuery) ||
        movie.genre.toLowerCase().includes(normalizedQuery)
      return byYear && byCategory && bySearch
    })
  }, [normalizedQuery, selectedCategory, selectedYear])

  const filteredTracks = useMemo(() => {
    return normalizedTracks.filter((track) => {
      const byYear =
        selectedYear === 'all' ||
        String(track.releaseYear) === selectedYear ||
        (selectedYear === 'other' && track.releaseYear !== 2026 && track.releaseYear !== 2025 && track.releaseYear !== 2024)
      const byCategory = selectedCategory === 'All' || track.genre.toLowerCase().includes(selectedCategory.toLowerCase())
      const bySearch =
        !normalizedQuery ||
        track.title.toLowerCase().includes(normalizedQuery) ||
        track.artist.toLowerCase().includes(normalizedQuery) ||
        track.genre.toLowerCase().includes(normalizedQuery)
      return byYear && byCategory && bySearch
    })
  }, [normalizedQuery, normalizedTracks, selectedCategory, selectedYear])

  const filteredMatches = useMemo(() => {
    return getAllMatches().filter((match) => {
      const byLeague = selectedLeague === 'all' || match.league === selectedLeague
      const byYear = selectedYear === 'all' || selectedYear === '2026'
      const byCategory = selectedCategory === 'All' || match.league.toLowerCase().includes(selectedCategory.toLowerCase())
      const bySearch =
        !normalizedQuery ||
        match.league.toLowerCase().includes(normalizedQuery) ||
        match.team1.name.toLowerCase().includes(normalizedQuery) ||
        match.team2.name.toLowerCase().includes(normalizedQuery)
      return byLeague && byYear && byCategory && bySearch
    })
  }, [normalizedQuery, selectedCategory, selectedLeague, selectedYear])

  const currentTrack = filteredTracks[currentTrackIndex] ?? filteredTracks[0] ?? normalizedTracks[0]

  useEffect(() => {
    if (currentTrackIndex >= filteredTracks.length) {
      setCurrentTrackIndex(0)
    }
  }, [currentTrackIndex, filteredTracks.length])

  const clearAllFilters = () => {
    setSearch('')
    setSelectedYear('all')
    setSelectedCategory('All')
    setSelectedLeague('all')
  }

  const nextTrack = () => {
    if (filteredTracks.length === 0) return
    setCurrentTrackIndex((prev) => (prev + 1) % filteredTracks.length)
    setIsPlaying(true)
  }

  const previousTrack = () => {
    if (filteredTracks.length === 0) return
    setCurrentTrackIndex((prev) => (prev - 1 + filteredTracks.length) % filteredTracks.length)
    setIsPlaying(true)
  }

  const addPlaylist = () => {
    const name = playlistInput.trim()
    if (!name) return
    setPlaylists((prev) => (prev.includes(name) ? prev : [...prev, name]))
    setPlaylistInput('')
    toast({ title: t('playlistCreated'), description: name })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07090d] via-[#07090d] to-[#090f0c] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090d]/90 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{BRAND_NAME}</h1>
              <p className="text-sm text-cyan-300 transition-transform duration-300 will-change-transform">
                {t('streamfyFor')} {animatedWords[wordIndex]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value as typeof settings.language)}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-xs text-white"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 font-bold text-black">
                Z
              </div>
            </div>
          </div>
        </header>

        <section className="sticky top-[74px] z-40 mt-4 rounded-2xl border border-white/10 bg-[#0b1116]/95 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[210px] flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('startSearching')}
                className="w-full rounded-xl border border-white/15 bg-black/40 py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors focus:border-cyan-300"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value as (typeof filterYears)[number])}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm"
            >
              <option value="all">{t('allYears')}</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="other">{t('other')}</option>
            </select>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm"
            >
              <option value="all">{t('allLeagues')}</option>
              {leagues
                .filter((league) => league !== 'all')
                .map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
            </select>
            <button
              onClick={clearAllFilters}
              className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 transition-transform duration-200 hover:scale-[1.02]"
            >
              {t('clearAllFilters')}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-transform duration-200 hover:-translate-y-0.5 ${
                  selectedCategory === category
                    ? 'border-cyan-300 bg-cyan-400/20 text-cyan-100'
                    : 'border-white/15 bg-white/5 text-white/75'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <main className="mt-5 flex flex-col gap-8">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1118] p-5 sm:p-7">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                  {t('featuredSeries')}
                </span>
                <h2 className="text-4xl font-black tracking-tight sm:text-5xl">KYLEXY</h2>
                <p className="text-sm text-white/80">{t('heroMeta')}</p>
                <p className="max-w-2xl text-sm text-white/70 sm:text-base">{t('heroSummary')}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/movies/kylexy"
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <Play size={16} fill="black" />
                    {t('watchNow')}
                  </Link>
                  <button
                    onClick={() => {
                      setWatchLater((prev) => !prev)
                      toast({
                        title: watchLater ? t('removedFromWatchLater') : t('addedToWatchLater'),
                        description: 'KYLEXY',
                      })
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm transition-colors hover:bg-white/10"
                  >
                    {watchLater ? <Check size={16} /> : <ListPlus size={16} />}
                    {t('watchLater')}
                  </button>
                </div>
              </div>
              <div className="relative h-[260px] overflow-hidden rounded-2xl sm:h-[320px]">
                <Image src="/now-in-theaters.jpg" alt="KYLEXY" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold">{t('movies')}</h3>
                <p className="text-sm text-white/65">{t('verticalMovieList')}</p>
              </div>
              <Link href="/movies" className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
                {t('seeAll')} <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMovies.map((movie, index) => (
                <article key={movie.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <div className="relative h-52">
                    <Image src={movie.image} alt={movie.title} fill className="object-cover" loading="lazy" />
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-lg font-semibold">{movie.title}</p>
                    <p className="text-xs text-white/65">
                      {t('seasonEpisode')} {Math.max(1, (index % 4) + 1)}-{Math.max(1, (index % 10) + 1)} | {movie.year}
                    </p>
                    <p className="text-xs text-white/60">{movie.genre}</p>
                    <div className="flex items-center gap-2 text-amber-300">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} fill={movie.rating / 2 >= star ? 'currentColor' : 'none'} />
                      ))}
                      <span className="text-xs text-white/70">{movie.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10">{t('addToList')}</button>
                      <Link href={`/movies/${movie.id}`} className="rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-black">
                        {t('moreInfo')}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold">{t('music')}</h3>
                <p className="text-sm text-white/65">{t('verticalMusicList')}</p>
              </div>
              <Link href="/music" className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
                {t('seeAll')} <ChevronRight size={15} />
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={previousTrack} className="rounded-full border border-white/20 p-2 hover:bg-white/10" aria-label="Previous">
                  <SkipBack size={16} />
                </button>
                <button
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="rounded-full bg-cyan-400 p-2 text-black transition-transform duration-200 hover:scale-105"
                  aria-label={isPlaying ? t('pause') : t('play')}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} fill="black" />}
                </button>
                <button onClick={nextTrack} className="rounded-full border border-white/20 p-2 hover:bg-white/10" aria-label="Next">
                  <SkipForward size={16} />
                </button>
                <p className="ml-2 text-sm text-white/80">
                  {currentTrack?.title} <span className="text-white/55">- {currentTrack?.artist}</span>
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTracks.map((track, idx) => (
                  <article key={track.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="relative h-40 overflow-hidden rounded-lg">
                      <Image src={track.image} alt={track.title} fill className="object-cover" loading="lazy" />
                    </div>
                    <p className="mt-2 text-sm font-semibold">{track.title}</p>
                    <p className="text-xs text-white/60">{track.artist}</p>
                    <button
                      onClick={() => {
                        setCurrentTrackIndex(idx)
                        setIsPlaying(true)
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-cyan-300/30 px-2.5 py-1 text-xs text-cyan-200 hover:bg-cyan-400/15"
                    >
                      <Play size={13} />
                      {t('play')}
                    </button>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-sm font-semibold">{t('playlist')}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={playlistInput}
                    onChange={(e) => setPlaylistInput(e.target.value)}
                    placeholder={t('playlistName')}
                    className="flex-1 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
                  />
                  <button onClick={addPlaylist} className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-black">
                    {t('addPlaylist')}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {playlists.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1 text-xs">
                      {item}
                      <button
                        onClick={() => setPlaylists((prev) => prev.filter((playlist) => playlist !== item))}
                        className="text-white/70 hover:text-white"
                        aria-label={`Remove ${item}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold">{t('sports')}</h3>
                <p className="text-sm text-white/65">{t('verticalSportsList')}</p>
              </div>
              <Link href="/sports" className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
                {t('seeAll')} <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid gap-3">
              {filteredMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/sports/${match.id}`}
                  className="group grid items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:grid-cols-[130px_1fr_auto]"
                >
                  <div className="relative h-20 overflow-hidden rounded-lg">
                    <Image src={match.heroImage ?? '/sports-hero.jpg'} alt={match.league} fill className="object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/35" />
                  </div>
                  <div>
                    <p className="text-sm text-cyan-200">{match.league}</p>
                    <p className="text-base font-semibold">
                      {match.team1.name} vs {match.team2.name}
                    </p>
                    <p className="text-xs text-white/65">
                      {match.status === 'live' ? `${match.score1 ?? 0} - ${match.score2 ?? 0}` : match.time}
                    </p>
                  </div>
                  <span className="justify-self-start rounded-full border border-white/20 px-3 py-1 text-xs text-white/75 sm:justify-self-end">
                    {match.status === 'live' ? t('liveNow') : t('upcoming')}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
