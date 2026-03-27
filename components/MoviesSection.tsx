'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Download, ListPlus, Play, Plus, Search, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { movieCards } from '@/lib/movies-data'
import { useAuth } from '@/components/AuthProvider'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation, type Language } from '@/lib/translations'

const featuredMeta: Record<string, { season: string; episode: string; director: string }> = {
  kylexy: { season: 'S2', episode: 'E8', director: 'K. Ortega' },
  'dark-pursuit': { season: 'S1', episode: 'E5', director: 'N. Adair' },
}

export function MoviesSection({ defaultType }: { defaultType?: 'All' | (typeof movieCards)[number]['type'] } = {}) {
  const { toast } = useToast()
  const router = useRouter()
  const { requireAuth } = useAuth()
  const { settings, updateSetting } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  const [genreFilter, setGenreFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState<'All' | (typeof movieCards)[number]['type']>(defaultType ?? 'All')
  const [yearFilter, setYearFilter] = useState('All')
  const [ratingFilter, setRatingFilter] = useState('All')
  const [secondaryFilter, setSecondaryFilter] = useState('All genres')
  const [languageFilter, setLanguageFilter] = useState<'All' | Language>('All')
  const [search, setSearch] = useState('')

  const genres = useMemo(() => ['All', ...Array.from(new Set(movieCards.map((movie) => movie.genre)))], [])
  const years = useMemo(
    () => ['All', ...Array.from(new Set(movieCards.map((movie) => String(movie.year)))).sort().reverse()],
    []
  )

  const filteredMovies = useMemo(() => {
    return movieCards.filter((movie) => {
      const matchesGenre = genreFilter === 'All' || movie.genre === genreFilter
      const matchesType = typeFilter === 'All' || movie.type === typeFilter
      const matchesYear = yearFilter === 'All' || String(movie.year) === yearFilter
      const matchesRating = ratingFilter === 'All' || movie.rating >= Number(ratingFilter)
      const matchesSecondary = secondaryFilter === 'All genres' || movie.genre === secondaryFilter
      const matchesLanguage = languageFilter === 'All' ? true : movie.language === languageFilter
      const query = search.trim().toLowerCase()
      const matchesSearch =
        !query ||
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query) ||
        movie.genre.toLowerCase().includes(query)
      return matchesGenre && matchesType && matchesYear && matchesRating && matchesSecondary && matchesLanguage && matchesSearch
    })
  }, [genreFilter, ratingFilter, search, secondaryFilter, yearFilter, languageFilter, typeFilter])

  const featured = filteredMovies.find((movie) => movie.id === 'kylexy') ?? filteredMovies[0] ?? movieCards[0]
  const listMovies = filteredMovies.filter((movie) => movie.id !== featured.id)

  const clearAllFilters = () => {
    setGenreFilter('All')
    setTypeFilter(defaultType ?? 'All')
    setYearFilter('All')
    setRatingFilter('All')
    setSecondaryFilter('All genres')
    setLanguageFilter('All')
    setSearch('')
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('movies')}</h2>
          <p className="text-sm text-gray-400">{t('verticalMovieList')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              requireAuth(
                () => router.push('/downloader'),
                t('authSigninPrompt')
              )
            }
            className="flex items-center gap-1 text-sm text-white/80 transition-colors hover:text-white"
          >
            <Download size={14} />
            {t('download')}
          </button>
          <Link href="/movies" className="flex items-center gap-1 text-sm text-[#f4a30a] hover:underline">
            {t('seeAll')} <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#071325] p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto_auto_auto_auto]">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('startSearching')}
              className="w-full rounded-2xl border border-white/15 bg-black/45 py-3 pl-12 pr-3 text-sm text-white placeholder-white/40 outline-none focus:border-[#f4a30a]/70"
            />
          </div>

          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="appearance-none rounded-2xl border border-white/15 bg-black/45 px-4 py-3 pr-10 text-sm text-white"
            >
              <option value="All">{t('allYears')}</option>
              {years
                .filter((year) => year !== 'All')
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80" />
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="appearance-none rounded-2xl border border-white/15 bg-black/45 px-4 py-3 pr-10 text-sm text-white"
            >
              <option value="All">All types</option>
              <option value="movie">Movies</option>
              <option value="series">TV Shows</option>
              <option value="animation">Animation</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80" />
          </div>

          <div className="relative">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value as typeof languageFilter)}
              className="appearance-none rounded-2xl border border-white/15 bg-black/45 px-4 py-3 pr-10 text-sm text-white"
            >
              <option value="All">{t('selectLanguage')}</option>
              <option value="en">{t('english')}</option>
              <option value="fr">{t('french')}</option>
              <option value="rw">{t('kinyarwanda')}</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80" />
          </div>

          <div className="relative">
            <select
              value={secondaryFilter}
              onChange={(e) => setSecondaryFilter(e.target.value)}
              className="appearance-none rounded-2xl border border-white/15 bg-black/45 px-4 py-3 pr-10 text-sm text-white"
            >
              <option value="All genres">{t('allGenres')}</option>
              {genres
                .filter((genre) => genre !== 'All')
                .map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80" />
          </div>

          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="appearance-none rounded-2xl border border-white/15 bg-black/45 px-4 py-3 pr-10 text-sm text-white"
            >
              <option value="All">{t('rating')}</option>
              <option value="9">9+</option>
              <option value="8">8+</option>
              <option value="7">7+</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80" />
          </div>

          <button
            onClick={clearAllFilters}
            className="rounded-2xl border border-[#f4a30a]/40 bg-[#f4a30a]/10 px-4 py-3 text-sm text-[#f4a30a] transition-colors hover:bg-[#f4a30a]/15"
          >
            {t('clearAllFilters')}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {['All', 'Action', 'Comedy', 'Sci-Fi'].map((chip) => (
            <button
              key={chip}
              onClick={() => setGenreFilter(chip)}
              className={`rounded-full border px-4 py-2 text-sm ${
                genreFilter === chip
                  ? 'border-[#f4a30a] bg-[#f4a30a]/15 text-[#f4a30a]'
                  : 'border-white/15 bg-white/5 text-gray-300'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 streamfy-fade-slide">
        <div className="relative h-[320px] w-full">
          <Image
            src={featured.image}
            alt={featured.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end p-6">
          <div className="max-w-2xl animate-in slide-in-from-bottom-3 duration-500">
            <h3 className="text-3xl font-extrabold text-white">{featured.title}</h3>
            <p className="mt-1 text-sm text-gray-200">
              {(featuredMeta[featured.id]?.season ?? 'S1')} | {(featuredMeta[featured.id]?.episode ?? 'E1')} | {featured.genre} | {featured.year} | Director: {featuredMeta[featured.id]?.director ?? 'Unknown'}
            </p>
            <p className="mt-2 text-sm text-gray-300">{featured.description}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/movies/${featured.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f4a30a] px-4 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
              >
                <Play size={16} fill="black" />
                {t('watchNow')}
              </Link>
              <button
                onClick={() => {
                  const inWatchLater = settings.watchlistMovies.includes(featured.id)
                  const next = inWatchLater
                    ? settings.watchlistMovies.filter((id) => id !== featured.id)
                    : [...settings.watchlistMovies, featured.id]
                  updateSetting('watchlistMovies', next)
                  toast({
                    title: inWatchLater ? t('removedFromWatchLater') : t('addedToWatchLater'),
                    description: featured.title,
                  })
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
              >
                <ListPlus size={16} />
                {t('watchLater')}
              </button>
            </div>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listMovies.map((movie, i) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            aria-label={movie.title}
          >
            <article>
              <div className="relative h-56">
                <Image
                  src={movie.image}
                  alt={movie.title}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03] will-change-transform"
                />
              </div>
              <div className="space-y-2 p-4">
                <p className="text-lg font-semibold text-white">{movie.title}</p>
                <p className="text-xs text-gray-400">
                  S{(i % 3) + 1} | E{(i % 9) + 1} | {movie.year}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-[#f4a30a]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={13} fill={movie.rating / 2 >= star ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-300">{movie.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const inList = settings.watchlistMovies.includes(movie.id)
                      const next = inList
                        ? settings.watchlistMovies.filter((id) => id !== movie.id)
                        : [...settings.watchlistMovies, movie.id]
                      updateSetting('watchlistMovies', next)
                      toast({
                        title: inList ? 'Removed from list' : 'Added to list',
                        description: movie.title,
                      })
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                  >
                    <Plus size={12} />
                    Add to list
                  </button>
                  <span className="rounded-lg bg-[#f4a30a] px-3 py-1.5 text-xs font-semibold text-black">More info</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
